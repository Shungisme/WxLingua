import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_EMAIL'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: `"WxLingua" <${this.configService.get<string>('SMTP_EMAIL')}>`,
      to,
      subject: 'Mã xác nhận đặt lại mật khẩu - WxLingua',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; }
              .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Đặt lại mật khẩu</h1>
              </div>
              <div class="content">
                <p>Xin chào,</p>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản WxLingua của mình.</p>
                
                <div class="code-box">
                  <p style="margin: 0 0 10px 0; color: #666;">Mã xác nhận của bạn:</p>
                  <div class="code">${code}</div>
                </div>

                <p>Vui lòng nhập mã này vào trang đặt lại mật khẩu. Mã này có hiệu lực trong <strong>1 giờ</strong>.</p>

                <div class="warning">
                  ⚠️ <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
                </div>

                <div class="footer">
                  <p>Trân trọng,<br><strong>Đội ngũ WxLingua</strong></p>
                  <p style="font-size: 12px; color: #999;">Email này được gửi tự động, vui lòng không trả lời.</p>
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
