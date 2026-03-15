import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  Put,
  Logger,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../../../core/dtos/auth/register.dto';
import { LoginDto } from '../../../core/dtos/auth/login.dto';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../../core/dtos/auth/profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../../../shared/types/auth-user.type';
import { handleControllerException } from '../../../shared/utils/response.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'register',
      });
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.authService.login(user); // user here is the user entity without password
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'login',
      });
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: ExpressRequest) {
    try {
      const authReq = req as AuthenticatedRequest;
      return authReq.user;
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getProfile',
      });
    }
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile (name, avatar)' })
  async updateProfile(
    @Request() req: ExpressRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.authService.updateProfile(
        authReq.user.id,
        updateProfileDto,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'updateProfile',
      });
    }
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Request() req: ExpressRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.authService.changePassword(
        authReq.user.id,
        changePasswordDto,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'changePassword',
      });
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset code via email' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'forgotPassword',
      });
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with code from email' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(resetPasswordDto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'resetPassword',
      });
    }
  }
}
