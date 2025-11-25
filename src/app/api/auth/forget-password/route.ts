import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log('🔍 User found:', user ? user.email : 'NO USER');

        // Always return success message
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.',
            });
        }

        // Generate reset token
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        console.log('🔐 Token generated:');
        console.log('Plain token:', resetToken);
        console.log('Hashed token:', resetTokenHash);

        // Save token to database using findOneAndUpdate

        const updateResult = await User.updateOne(
            { email: email.toLowerCase() },
            {
                $set: {
                    resetPasswordToken: resetTokenHash,
                    resetPasswordExpires: new Date(Date.now() + 3600000)
                }
            }
        );

        console.log('📊 Update result:', updateResult);

        // Verify it was saved
        const updatedUser = await User.findOne(
            { email: email.toLowerCase() }
        ).select('+resetPasswordToken +resetPasswordExpires').lean();

        console.log('✅ User after update:', updatedUser);



        // const updatedUser = await User.findOneAndUpdate(
        //   { _id: user._id },
        //   { 
        //     resetPasswordToken: resetTokenHash,
        //     resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        //   },
        //   { 
        //     new: true, // Return updated document
        //     select: 'email resetPasswordToken resetPasswordExpires' // Only select these fields
        //   }
        // );
        let updatedUser2 = await User.findOne({ email: email.toLowerCase() });
        console.log('🔍 Saved Updated user found:', updatedUser2 ? updatedUser2 : 'NO USER');



        // Create reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
        console.log('📧 Reset URL:', resetUrl);

        // Determine email configuration
        const emailUser = process.env.EMAIL_USER;

        if (emailUser?.includes('gmail.com')) {
            // Use Gmail configuration
            console.log('📧 Using Gmail configuration');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

           
            const mailOptions = {
                from: `"TechCodeByte" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Reset Request - TechCodeByte',
                html: `
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                  </head>
                  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 40px 0;">
                          <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                            
                            <!-- Header -->
                            <tr>
                              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">TechCodeByte</h1>
                                <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px;">Password Reset Request</p>
                              </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                              <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Hello ${user.firstName || 'there'}!</h2>
                                
                                <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                  We received a request to reset your password for your TechCodeByte account. If you didn't make this request, you can safely ignore this email.
                                </p>
                                
                                <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                  To reset your password, click the button below:
                                </p>
                                
                                <!-- Button -->
                                <table role="presentation" style="margin: 0 auto;">
                                  <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                      <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                                        Reset Password
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                                
                                <p style="margin: 30px 0 20px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                                  Or copy and paste this link into your browser:
                                </p>
                                
                                <p style="margin: 0 0 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px; word-break: break-all; font-size: 13px; color: #667eea;">
                                  ${resetUrl}
                                </p>
                                
                                <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                  <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                    ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact our support team.
                                  </p>
                                </div>
                              </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                              <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                                  © ${new Date().getFullYear()} TechCodeByte. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                                  This is an automated email. Please do not reply to this message.
                                </p>
                              </td>
                            </tr>
                            
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log('📨 Gmail sent successfully');

        } else if (emailUser?.includes('ethereal.email')) {
            // Use Ethereal configuration
            console.log('📧 Using Ethereal configuration');
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: `"TechCodeByte" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Password Reset Request - TechCodeByte',
                html: `
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset</title>
                  </head>
                  <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 40px 0;">
                          <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                            
                            <!-- Header -->
                            <tr>
                              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">TechCodeByte</h1>
                                <p style="margin: 10px 0 0 0; color: #f0f0f0; font-size: 14px;">Password Reset Request</p>
                              </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                              <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Hello ${user.firstName || 'there'}!</h2>
                                
                                <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                  We received a request to reset your password for your TechCodeByte account. If you didn't make this request, you can safely ignore this email.
                                </p>
                                
                                <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                  To reset your password, click the button below:
                                </p>
                                
                                <!-- Button -->
                                <table role="presentation" style="margin: 0 auto;">
                                  <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                      <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                                        Reset Password
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                                
                                <p style="margin: 30px 0 20px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                                  Or copy and paste this link into your browser:
                                </p>
                                
                                <p style="margin: 0 0 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px; word-break: break-all; font-size: 13px; color: #667eea;">
                                  ${resetUrl}
                                </p>
                                
                                <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                  <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                    ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact our support team.
                                  </p>
                                </div>
                              </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                              <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                                  © ${new Date().getFullYear()} TechCodeByte. All rights reserved.
                                </p>
                                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                                  This is an automated email. Please do not reply to this message.
                                </p>
                              </td>
                            </tr>
                            
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log('📨 Ethereal email sent - check Ethereal inbox');

        } else {
            // No email configured - return URL for testing
            console.log('⚠️ No email configured - returning URL in response');
            return NextResponse.json({
                success: true,
                message: 'Password reset link generated. Check server logs for URL.',
                debugUrl: resetUrl
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Password reset link has been sent to your email.',
        });

    } catch (error) {
        console.error('❌ Forgot password error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process request. Please try again.' },
            { status: 500 }
        );
    }
}