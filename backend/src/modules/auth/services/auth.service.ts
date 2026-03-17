import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';
import { RegisterDto } from '../../../core/dtos/auth/register.dto';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../../core/dtos/auth/profile.dto';
import { EmailService } from '../../email/email.service';
import { StorageService } from '../../storage/storage.service';
import * as bcrypt from 'bcrypt';

type LoginUser = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
};

const SYSTEM_AVATARS = [
  '/images/avatars/avatar-01.png',
  '/images/avatars/avatar-02.png',
  '/images/avatars/avatar-03.png',
  '/images/avatars/avatar-04.png',
  '/images/avatars/avatar-05.png',
  '/images/avatars/avatar-06.png',
  '/images/avatars/avatar-07.png',
  '/images/avatars/avatar-08.png',
] as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  private pickRandomSystemAvatar(): string {
    const randomIndex = Math.floor(Math.random() * SYSTEM_AVATARS.length);
    return SYSTEM_AVATARS[randomIndex];
  }

  private isSystemAvatar(url?: string | null): boolean {
    if (!url) {
      return false;
    }
    return SYSTEM_AVATARS.includes(url as (typeof SYSTEM_AVATARS)[number]);
  }

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
        avatar: this.pickRandomSystemAvatar(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    return this.login(user);
  }

  login(user: LoginUser) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<LoginUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        password: true,
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      };
    }

    return null;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateProfileDto.name,
        avatar: updateProfileDto.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, avatar: true },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const uploaded = await this.storageService.uploadAvatarImage(
      file.buffer,
      file.mimetype,
      file.originalname,
      userId,
    );

    if (user.avatar && !this.isSystemAvatar(user.avatar)) {
      await this.storageService.deleteObjectByUrl(user.avatar);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: uploaded.url },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });
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
