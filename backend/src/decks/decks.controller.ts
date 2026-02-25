import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { AddWordsToDeckDto } from './dto/add-words.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Decks')
@Controller('decks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateDeckDto) {
    return this.decksService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() query: any) {
    const userId = user.id;
    return this.decksService.findAll(userId, query);
  }

  @Post(':id/words')
  addWords(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddWordsToDeckDto,
  ) {
    return this.decksService.addWords(user.id, id, dto.wordIds);
  }

  @Get(':id/cards')
  @Public()
  findOne(@Param('id') id: string) {
    return this.decksService.findOne(id);
  }
}
