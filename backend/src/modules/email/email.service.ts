import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const smtpUser = this.configService.get<string>('SMTP_EMAIL') ?? '';
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD') ?? '';

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"WxLingua" <${this.configService.get<string>('SMTP_EMAIL')}>`,
      to,
      subject: 'Password Reset Code - WxLingua',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #111827;
                color: #f3f4f6;
                font-family: 'Courier New', monospace;
                image-rendering: pixelated;
              }
              .container {
                max-width: 620px;
                margin: 0 auto;
                padding: 20px;
              }
              .panel {
                border: 4px solid #0b0f1a;
                background: #1f2937;
                box-shadow: 8px 8px 0 #0b0f1a;
              }
              .header {
                background: repeating-linear-gradient(
                  45deg,
                  #3b82f6,
                  #3b82f6 10px,
                  #2563eb 10px,
                  #2563eb 20px
                );
                color: #ffffff;
                padding: 20px;
                text-align: center;
                border-bottom: 4px solid #0b0f1a;
              }
              .title {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
              .content {
                padding: 24px;
                background: #111827;
              }
              .content p {
                margin: 0 0 14px;
                line-height: 1.7;
                color: #e5e7eb;
                font-size: 14px;
              }
              .code-box {
                background: #0f172a;
                border: 3px solid #22d3ee;
                box-shadow: 4px 4px 0 #164e63;
                padding: 18px;
                text-align: center;
                margin: 22px 0;
              }
              .code-label {
                margin: 0 0 10px 0;
                font-size: 12px;
                text-transform: uppercase;
                color: #67e8f9;
                letter-spacing: 1px;
              }
              .code {
                font-size: 34px;
                font-weight: 700;
                color: #facc15;
                letter-spacing: 8px;
                text-shadow: 2px 2px 0 #854d0e;
              }
              .warning {
                margin: 20px 0;
                padding: 14px;
                border: 3px solid #f97316;
                background: #7c2d12;
                color: #ffedd5;
                box-shadow: 4px 4px 0 #431407;
                font-size: 13px;
              }
              .footer {
                margin-top: 24px;
                padding-top: 16px;
                border-top: 2px dashed #334155;
                color: #94a3b8;
                font-size: 12px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="panel">
                <div class="header">
                  <h1 class="title">Reset Your Password</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>We received a request to reset your WxLingua account password.</p>

                  <div class="code-box">
                    <p class="code-label">Your verification code</p>
                    <div class="code">${code}</div>
                  </div>

                  <p>Please enter this code on the password reset page. The code expires in <strong>1 hour</strong>.</p>

                  <div class="warning">
                    <strong>Security note:</strong> If you did not request this reset, you can safely ignore this message.
                  </div>

                  <div class="footer">
                    <p>Best regards,<br><strong>The WxLingua Team</strong></p>
                    <p>This is an automated email. Please do not reply.</p>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Generate a random 6-digit code
   */
  generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
