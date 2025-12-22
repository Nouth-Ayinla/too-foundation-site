import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a 6-digit numeric code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash password (same as in auth.ts)
function hashPassword(password: string): string {
  return btoa(password);
}

// Request password reset - creates 6-digit code
export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    
    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (!user) {
      // Don't reveal if user exists - return success anyway
      return { success: true, message: "If an account exists, a reset code will be sent." };
    }
    
    // Invalidate any existing codes for this email
    const existingCodes = await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    
    for (const codeRecord of existingCodes) {
      await ctx.db.patch(codeRecord._id, { used: true });
    }
    
    // Generate new 6-digit code (expires in 10 minutes)
    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await ctx.db.insert("password_reset_tokens", {
      email,
      code,
      expires_at: expiresAt,
      used: false,
      attempts: 0,
      created_at: Date.now(),
    });
    
    return { 
      success: true, 
      code, // Return code so HTTP action can send email
      message: "If an account exists, a reset code will be sent." 
    };
  },
});

// Verify 6-digit code is valid
export const verifyResetCode = query({
  args: { code: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const code = args.code.trim();
    
    const resetCode = await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .first();
    
    if (!resetCode) {
      return { valid: false, error: "Invalid reset code" };
    }
    
    if (resetCode.used) {
      return { valid: false, error: "This code has already been used" };
    }
    
    if (resetCode.expires_at < Date.now()) {
      return { valid: false, error: "This code has expired" };
    }
    
    if (resetCode.attempts >= 5) {
      return { valid: false, error: "Too many failed attempts. Please request a new code." };
    }
    
    if (resetCode.code !== code) {
      return { valid: false, error: "Invalid code" };
    }
    
    return { valid: true, email: resetCode.email };
  },
});

// Increment failed attempts
export const incrementAttempts = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    
    const resetCode = await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .first();
    
    if (resetCode && !resetCode.used) {
      await ctx.db.patch(resetCode._id, { 
        attempts: resetCode.attempts + 1 
      });
    }
  },
});

// Reset password with code
export const resetPassword = mutation({
  args: { 
    email: v.string(),
    code: v.string(),
    new_password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const code = args.code.trim();
    
    // Validate password
    if (args.new_password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    
    // Find and validate code
    const resetCode = await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .first();
    
    if (!resetCode) {
      throw new Error("Invalid reset code");
    }
    
    if (resetCode.used) {
      throw new Error("This code has already been used");
    }
    
    if (resetCode.expires_at < Date.now()) {
      throw new Error("This code has expired");
    }
    
    if (resetCode.code !== code) {
      // Increment attempts
      await ctx.db.patch(resetCode._id, { 
        attempts: resetCode.attempts + 1 
      });
      throw new Error("Invalid code");
    }
    
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update password
    await ctx.db.patch(user._id, {
      password_hash: hashPassword(args.new_password),
      updatedAt: Date.now(),
    });
    
    // Mark code as used
    await ctx.db.patch(resetCode._id, { used: true });
    
    return { success: true, message: "Password has been reset successfully" };
  },
});
