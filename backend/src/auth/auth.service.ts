import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/profile.dto';
import { EmailService } from '../common/email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return this.login(user);
  }

  async login(user: any) {
    // Check if user is coming from login DTO (needs lookup) or is already a user object
    let userData = user;
    if (user.email && !user.id) {
      // This path is usually handled by a LocalStrategy, but here we do it directly for simplicity or keep it separated
      // Actually, let's keep login specifically for LoginDto processing or User object token generation.
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateProfileDto.name,
        avatar: updateProfileDto.avatar,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If email exists, verification code has been sent' };
    }

    // Generate 6-digit code
    const code = this.emailService.generateResetCode();
    const hashedCode = await bcrypt.hash(code, 10);

    // Delete any existing unused tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Create new reset token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire in 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedCode,
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendPasswordResetEmail(user.email, code);

    return { message: 'Verification code has been sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { code, newPassword } = resetPasswordDto;

    // Find all non-expired, unused tokens
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    // Check which token matches the code
    let matchedToken: (typeof tokens)[0] | null = null;
    for (const token of tokens) {
      const isMatch = await bcrypt.compare(code, token.token);
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Verification code is invalid or expired');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: matchedToken.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { used: true },
    });

    return { message: 'Password has been reset successfully' };
  }
}
