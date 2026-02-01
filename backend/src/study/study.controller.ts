import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { StudyService } from './study.service';
import { StudySessionDto } from './dto/study-session.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Study')
@Controller('study')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('next')
  @ApiOperation({ summary: 'Get next cards to review' })
  getNextCards(@Request() req, @Query('deckId') deckId?: string, @Query('limit') limit?: string) {
    return this.studyService.getNextCards(req.user.id, deckId, limit ? +limit : 10);
  }

  @Post('session')
  @ApiOperation({ summary: 'Log study session result' })
  logSession(@Request() req, @Body() dto: StudySessionDto) {
    return this.studyService.logSession(req.user.id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get study statistics' })
  getStats(@Request() req) {
    return this.studyService.getStats(req.user.id);
  }
}
