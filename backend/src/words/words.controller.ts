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
} from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordAudioDto } from './dto/update-word-audio.dto';
import { LanguageValidationPipe } from '../common/pipes/language-validation.pipe';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FindWordsQuery } from './words.service';

@ApiTags('Words')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new word' })
  @UsePipes(LanguageValidationPipe)
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(createWordDto);
  }

  @Get()
  @ApiOperation({ summary: 'List words with filters' })
  findAll(@Query() query: FindWordsQuery) {
    return this.wordsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a word details' })
  findOne(@Param('id') id: string) {
    return this.wordsService.findOne(id);
  }

  @Patch(':id/audio')
  @ApiOperation({ summary: 'Set audio URL for a word (S3)' })
  @ApiBody({
    type: UpdateWordAudioDto,
  })
  updateAudioUrl(@Param('id') id: string, @Body() body: UpdateWordAudioDto) {
    return this.wordsService.updateAudio(id, body.audioUrl);
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
  uploadAudio(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.wordsService.uploadAudio(id, file);
  }

  @Delete(':id/audio')
  @ApiOperation({ summary: 'Delete audio from S3 and clear audio URL' })
  removeAudio(@Param('id') id: string) {
    return this.wordsService.deleteAudio(id);
  }
}
