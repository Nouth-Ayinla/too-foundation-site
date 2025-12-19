import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Send password reset email via Brevo
http.route({
  path: "/send-reset-email",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const { email, token, resetUrl } = await request.json();
      
      // @ts-ignore - process.env is available in Convex runtime
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      
      if (!BREVO_API_KEY) {
        console.error("BREVO_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: "Email service not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: "Irede Foundation",
            email: "noreply@iredefoundation.org", // Replace with your verified sender
          },
          to: [{ email }],
          subject: "Reset Your Password - Irede Foundation",
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
                .button { 
                  display: inline-block; 
                  background: #2563eb; 
                  color: white; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  margin: 20px 0;
                }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Irede Foundation</h1>
                </div>
                <div class="content">
                  <h2>Password Reset Request</h2>
                  <p>We received a request to reset your password. Click the button below to create a new password:</p>
                  <p style="text-align: center;">
                    <a href="${resetUrl}?token=${token}" class="button">Reset Password</a>
                  </p>
                  <p>This link will expire in 1 hour.</p>
                  <p>If you didn't request this password reset, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Irede Foundation. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Brevo API error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to send email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Password reset email sent to:", email);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error sending reset email:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }),
});

// CORS preflight
http.route({
  path: "/send-reset-email",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
