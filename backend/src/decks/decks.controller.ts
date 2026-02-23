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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Decks')
@Controller('decks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateDeckDto) {
    return this.decksService.create(req.user.id, dto);
  }

  @Get()
  @Public()
  findAll(@Request() req, @Query() query: any) {
    const userId = req.user?.id;
    return this.decksService.findAll(userId, query);
  }

  @Post(':id/words')
  addWords(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddWordsToDeckDto,
  ) {
    return this.decksService.addWords(req.user.id, id, dto.wordIds);
  }

  @Get(':id/cards')
  @Public()
  findOne(@Param('id') id: string) {
    return this.decksService.findOne(id);
  }
}
