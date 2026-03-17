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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DecksService } from '../services/decks.service';
import { FindDecksQuery } from '../services/decks.service';
import { CreateDeckDto } from '../../../core/dtos/decks/create-deck.dto';
import { AddWordsToDeckDto } from '../../../core/dtos/decks/add-words.dto';
import { CreateDeckCardDto } from '../../../core/dtos/decks/create-deck-card.dto';
import { UpdateDeckCardDto } from '../../../core/dtos/decks/update-deck-card.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../../core/decorators/public.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { BulkImportWordsDto } from '../../../core/dtos/decks/bulk-import-words.dto';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { handleControllerException } from '../../../shared/utils/response.util';
import { Response } from 'express';

@ApiTags('Decks')
@Controller('decks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DecksController {
  private readonly logger = new Logger(DecksController.name);

  constructor(private readonly decksService: DecksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deck' })
  async create(@CurrentUser() user: User, @Body() dto: CreateDeckDto) {
    try {
      return await this.decksService.create(user.id, dto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'create',
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'List decks' })
  async findAll(@CurrentUser() user: User, @Query() query: FindDecksQuery) {
    try {
      return await this.decksService.findAll(user.id, query);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'findAll',
      });
    }
  }

  @Get(':id/cards')
  @Public()
  @ApiOperation({ summary: 'Get deck with all cards' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.decksService.findOne(id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'findOne',
      });
    }
  }

  @Get(':id/export/csv')
  @ApiOperation({ summary: 'Export deck cards to CSV' })
  async exportCsv(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const csv = await this.decksService.exportDeckAsCsv(user.id, id);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="deck-${id}.csv"`,
      );
      return csv;
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'exportCsv',
      });
    }
  }

  @Post(':id/words')
  @ApiOperation({ summary: 'Add dictionary words to deck by ID list' })
  async addWords(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: AddWordsToDeckDto,
  ) {
    try {
      return await this.decksService.addWords(user.id, id, dto.wordIds);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'addWords',
      });
    }
  }

  @Post(':id/cards')
  @ApiOperation({ summary: 'Create a custom card in a deck' })
  async createCard(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateDeckCardDto,
  ) {
    try {
      return await this.decksService.createCard(user.id, id, dto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'createCard',
      });
    }
  }

  @Patch(':id/cards/:cardId')
  @ApiOperation({
    summary: 'Update a deck card (term, meaning, pronunciation, image, notes)',
  })
  async updateCard(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateDeckCardDto,
  ) {
    try {
      return await this.decksService.updateCard(user.id, id, cardId, dto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'updateCard',
      });
    }
  }

  @Delete(':id/cards/:cardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a card from a deck' })
  async removeCard(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('cardId') cardId: string,
  ) {
    try {
      return await this.decksService.removeCard(user.id, id, cardId);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'removeCard',
      });
    }
  }

  @Post(':id/words/bulk-import')
  @ApiOperation({ summary: 'Bulk import words by text (one per line)' })
  async bulkImport(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: BulkImportWordsDto,
  ) {
    try {
      return await this.decksService.bulkImportByText(user.id, id, dto.texts);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'bulkImport',
      });
    }
  }

  @Post(':id/bulk-import/file')
  @ApiOperation({ summary: 'Bulk import deck cards from CSV or Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        if (
          allowed.includes(file.mimetype) ||
          ['csv', 'xlsx', 'xls'].includes(ext ?? '')
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only .csv, .xlsx and .xls files are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async bulkImportFile(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) throw new BadRequestException('No file uploaded');
      return await this.decksService.bulkImportFromFile(
        user.id,
        id,
        file.buffer,
        file.originalname,
      );
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'bulkImportFile',
      });
    }
  }
}
