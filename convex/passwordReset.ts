import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Hash password (same as in auth.ts)
function hashPassword(password: string): string {
  return btoa(password);
}

// Request password reset - creates token
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
      return { success: true, message: "If an account exists, a reset email will be sent." };
    }
    
    // Invalidate any existing tokens for this email
    const existingTokens = await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    
    for (const token of existingTokens) {
      await ctx.db.patch(token._id, { used: true });
    }
    
    // Generate new token (expires in 1 hour)
    const token = generateToken();
    const expiresAt = Date.now() + 60 * 60 * 1000;
    
    await ctx.db.insert("password_reset_tokens", {
      email,
      token,
      expires_at: expiresAt,
      used: false,
      created_at: Date.now(),
    });
    
    return { 
      success: true, 
      token, // Return token so HTTP action can send email
      message: "If an account exists, a reset email will be sent." 
    };
  },
});

// Verify token is valid
export const verifyResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    
    if (!resetToken) {
      return { valid: false, error: "Invalid reset token" };
    }
    
    if (resetToken.used) {
      return { valid: false, error: "This reset link has already been used" };
    }
    
    if (resetToken.expires_at < Date.now()) {
      return { valid: false, error: "This reset link has expired" };
    }
    
    return { valid: true, email: resetToken.email };
  },
});

// Reset password with token
export const resetPassword = mutation({
  args: { 
    token: v.string(),
    new_password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate password
    if (args.new_password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    
    // Find and validate token
    const resetToken = await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    
    if (!resetToken) {
      throw new Error("Invalid reset token");
    }
    
    if (resetToken.used) {
      throw new Error("This reset link has already been used");
    }
    
    if (resetToken.expires_at < Date.now()) {
      throw new Error("This reset link has expired");
    }
    
    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", resetToken.email))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update password
    await ctx.db.patch(user._id, {
      password_hash: hashPassword(args.new_password),
      updatedAt: Date.now(),
    });
    
    // Mark token as used
    await ctx.db.patch(resetToken._id, { used: true });
    
    return { success: true, message: "Password has been reset successfully" };
  },
});
