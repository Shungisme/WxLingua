import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { WordsService } from '../services/words.service';
import { CreateWordDto } from '../../../core/dtos/words/create-word.dto';
import { UpdateWordAudioDto } from '../../../core/dtos/words/update-word-audio.dto';
import { LanguageValidationPipe } from '../../../core/pipes/language-validation.pipe';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FindWordsQuery } from '../services/words.service';
import { handleControllerException } from '../../../shared/utils/response.util';

@ApiTags('Words')
@Controller('words')
export class WordsController {
  private readonly logger = new Logger(WordsController.name);

  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new word' })
  @UsePipes(LanguageValidationPipe)
  async create(@Body() createWordDto: CreateWordDto) {
    try {
      return await this.wordsService.create(createWordDto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'create',
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'List words with filters' })
  async findAll(@Query() query: FindWordsQuery) {
    try {
      return await this.wordsService.findAll(query);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'findAll',
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a word details' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.wordsService.findOne(id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'findOne',
      });
    }
  }

  @Patch(':id/audio')
  @ApiOperation({ summary: 'Set audio URL for a word (S3)' })
  @ApiBody({
    type: UpdateWordAudioDto,
  })
  async updateAudioUrl(
    @Param('id') id: string,
    @Body() body: UpdateWordAudioDto,
  ) {
    try {
      return await this.wordsService.updateAudio(id, body.audioUrl);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'updateAudioUrl',
      });
    }
  }

  @Post(':id/audio/upload')
  @ApiOperation({ summary: 'Upload audio file to S3 and bind to word' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^(audio\/.+|audio\/mpeg)$/)) {
          cb(new Error('Only audio files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  async uploadAudio(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return await this.wordsService.uploadAudio(id, file);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'uploadAudio',
      });
    }
  }

  @Delete(':id/audio')
  @ApiOperation({ summary: 'Delete audio from S3 and clear audio URL' })
  async removeAudio(@Param('id') id: string) {
    try {
      return await this.wordsService.deleteAudio(id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'removeAudio',
      });
    }
  }
}
