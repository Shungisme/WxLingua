import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { AddWordsToDeckDto } from './dto/add-words.dto';
import { UpdateDeckCardDto } from './dto/update-deck-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { BulkImportWordsDto } from './dto/bulk-import-words.dto';

@ApiTags('Decks')
@Controller('decks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deck' })
  create(@CurrentUser() user: User, @Body() dto: CreateDeckDto) {
    return this.decksService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List decks' })
  findAll(@CurrentUser() user: User, @Query() query: any) {
    return this.decksService.findAll(user.id, query);
  }

  @Get(':id/cards')
  @Public()
  @ApiOperation({ summary: 'Get deck with all cards' })
  findOne(@Param('id') id: string) {
    return this.decksService.findOne(id);
  }

  @Post(':id/words')
  @ApiOperation({ summary: 'Add dictionary words to deck by ID list' })
  addWords(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddWordsToDeckDto,
  ) {
    return this.decksService.addWords(user.id, id, dto.wordIds);
  }

  @Patch(':id/cards/:cardId')
  @ApiOperation({
    summary: 'Update a deck card (term, meaning, pronunciation, image, notes)',
  })
  updateCard(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateDeckCardDto,
  ) {
    return this.decksService.updateCard(user.id, id, cardId, dto);
  }

  @Delete(':id/cards/:cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a card from a deck' })
  removeCard(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('cardId') cardId: string,
  ) {
    return this.decksService.removeCard(user.id, id, cardId);
  }

  @Post(':id/words/bulk-import')
  @ApiOperation({ summary: 'Bulk import words by text (one per line)' })
  bulkImport(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: BulkImportWordsDto,
  ) {
    return this.decksService.bulkImportByText(user.id, id, dto.texts);
  }
}
