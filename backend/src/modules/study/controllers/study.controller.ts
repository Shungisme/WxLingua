import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { StudyService } from '../services/study.service';
import { StudySessionDto } from '../../../core/dtos/study/study-session.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../../shared/types/auth-user.type';
import { handleControllerException } from '../../../shared/utils/response.util';

@ApiTags('Study')
@Controller('study')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StudyController {
  private readonly logger = new Logger(StudyController.name);

  constructor(private readonly studyService: StudyService) {}

  @Get('next')
  @ApiOperation({ summary: 'Get next cards to study' })
  @ApiQuery({ name: 'deckId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({
    name: 'mode',
    required: false,
    enum: ['learn', 'review'],
    description: 'learn=all cards, review=due only (default)',
  })
  async getNextCards(
    @Request() req: ExpressRequest,
    @Query('deckId') deckId?: string,
    @Query('limit') limit?: string,
    @Query('mode') mode?: 'learn' | 'review',
  ) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.studyService.getNextCards(
        authReq.user.id,
        deckId,
        limit ? +limit : 20,
        mode ?? 'review',
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getNextCards',
      });
    }
  }

  @Post('session')
  @ApiOperation({
    summary: 'Log a review with 4-button rating (1=Again 2=Hard 3=Good 4=Easy)',
  })
  async logSession(
    @Request() req: ExpressRequest,
    @Body() dto: StudySessionDto,
  ) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.studyService.logSession(authReq.user.id, dto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'logSession',
      });
    }
  }

  @Post('undo')
  @ApiOperation({ summary: 'Undo the most recent review' })
  async undoLast(@Request() req: ExpressRequest) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.studyService.undoLast(authReq.user.id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'undoLast',
      });
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  async getStats(@Request() req: ExpressRequest) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.studyService.getStats(authReq.user.id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getStats',
      });
    }
  }

  @Get('daily-stats')
  @ApiOperation({ summary: 'Per-day review counts (for heatmap)' })
  @ApiQuery({ name: 'days', required: false })
  async getDailyStats(
    @Request() req: ExpressRequest,
    @Query('days') days?: string,
  ) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.studyService.getDailyStats(
        authReq.user.id,
        days ? +days : 84,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getDailyStats',
      });
    }
  }

  @Get('forecast')
  @ApiOperation({
    summary: 'Cards due per day for the next N days (forecast chart)',
  })
  @ApiQuery({ name: 'days', required: false })
  async getForecast(
    @Request() req: ExpressRequest,
    @Query('days') days?: string,
  ) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.studyService.getForecast(
        authReq.user.id,
        days ? +days : 14,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getForecast',
      });
    }
  }

  @Get('preview-intervals')
  @ApiOperation({
    summary: 'Preview next intervals for each rating without committing',
  })
  async previewIntervals(
    @Request() req: ExpressRequest,
    @Query('wordId') wordId: string,
  ) {
    try {
      const authReq = req as AuthenticatedRequest;
      return await this.studyService.previewIntervals(authReq.user.id, wordId);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'previewIntervals',
      });
    }
  }
}
