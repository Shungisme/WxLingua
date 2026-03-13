import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { StudyService } from './study.service';
import { StudySessionDto } from './dto/study-session.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../common/types/auth-user.type';

@ApiTags('Study')
@Controller('study')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StudyController {
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
  getNextCards(
    @Request() req: ExpressRequest,
    @Query('deckId') deckId?: string,
    @Query('limit') limit?: string,
    @Query('mode') mode?: 'learn' | 'review',
  ) {
    const authReq = req as AuthenticatedRequest;
    return this.studyService.getNextCards(
      authReq.user.id,
      deckId,
      limit ? +limit : 20,
      mode ?? 'review',
    );
  }

  @Post('session')
  @ApiOperation({
    summary: 'Log a review with 4-button rating (1=Again 2=Hard 3=Good 4=Easy)',
  })
  logSession(@Request() req: ExpressRequest, @Body() dto: StudySessionDto) {
    const authReq = req as AuthenticatedRequest;
    return this.studyService.logSession(authReq.user.id, dto);
  }

  @Post('undo')
  @ApiOperation({ summary: 'Undo the most recent review' })
  undoLast(@Request() req: ExpressRequest) {
    const authReq = req as AuthenticatedRequest;
    return this.studyService.undoLast(authReq.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  getStats(@Request() req: ExpressRequest) {
    const authReq = req as AuthenticatedRequest;
    return this.studyService.getStats(authReq.user.id);
  }

  @Get('daily-stats')
  @ApiOperation({ summary: 'Per-day review counts (for heatmap)' })
  @ApiQuery({ name: 'days', required: false })
  getDailyStats(@Request() req: ExpressRequest, @Query('days') days?: string) {
    const authReq = req as AuthenticatedRequest;
    return this.studyService.getDailyStats(authReq.user.id, days ? +days : 84);
  }

  @Get('forecast')
  @ApiOperation({
    summary: 'Cards due per day for the next N days (forecast chart)',
  })
  @ApiQuery({ name: 'days', required: false })
  getForecast(@Request() req: ExpressRequest, @Query('days') days?: string) {
    const authReq = req as AuthenticatedRequest;
    return this.studyService.getForecast(authReq.user.id, days ? +days : 14);
  }

  @Get('preview-intervals')
  @ApiOperation({
    summary: 'Preview next intervals for each rating without committing',
  })
  previewIntervals(
    @Request() req: ExpressRequest,
    @Query('wordId') wordId: string,
  ) {
    const authReq = req as AuthenticatedRequest;
    return this.studyService.previewIntervals(authReq.user.id, wordId);
  }
}
