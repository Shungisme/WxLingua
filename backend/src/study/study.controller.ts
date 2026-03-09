import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { StudyService } from './study.service';
import { StudySessionDto } from './dto/study-session.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Study')
@Controller('study')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('next')
  @ApiOperation({ summary: 'Get next cards to review (due + new)' })
  @ApiQuery({ name: 'deckId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getNextCards(
    @Request() req,
    @Query('deckId') deckId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.studyService.getNextCards(req.user.id, deckId, limit ? +limit : 20);
  }

  @Post('session')
  @ApiOperation({ summary: 'Log a review with 4-button rating (1=Again 2=Hard 3=Good 4=Easy)' })
  logSession(@Request() req, @Body() dto: StudySessionDto) {
    return this.studyService.logSession(req.user.id, dto);
  }

  @Post('undo')
  @ApiOperation({ summary: 'Undo the most recent review' })
  undoLast(@Request() req) {
    return this.studyService.undoLast(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  getStats(@Request() req) {
    return this.studyService.getStats(req.user.id);
  }

  @Get('daily-stats')
  @ApiOperation({ summary: 'Per-day review counts (for heatmap)' })
  @ApiQuery({ name: 'days', required: false })
  getDailyStats(@Request() req, @Query('days') days?: string) {
    return this.studyService.getDailyStats(req.user.id, days ? +days : 84);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Cards due per day for the next N days (forecast chart)' })
  @ApiQuery({ name: 'days', required: false })
  getForecast(@Request() req, @Query('days') days?: string) {
    return this.studyService.getForecast(req.user.id, days ? +days : 14);
  }

  @Get('preview-intervals')
  @ApiOperation({ summary: 'Preview next intervals for each rating without committing' })
  previewIntervals(@Request() req, @Query('wordId') wordId: string) {
    return this.studyService.previewIntervals(req.user.id, wordId);
  }
}
