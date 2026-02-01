import { Controller, Get, Post, Body, Patch, Param, Query, UsePipes, UseInterceptors, UploadedFile } from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { LanguageValidationPipe } from '../common/pipes/language-validation.pipe';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

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
  findAll(@Query() query: any) {
    return this.wordsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a word details' })
  findOne(@Param('id') id: string) {
    return this.wordsService.findOne(id);
  }

  @Patch(':id/audio')
  @ApiOperation({ summary: 'Upload audio for a word' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/audio',
      filename: (req, file, cb) => {
        cb(null, `${uuid()}${extname(file.originalname)}`);
      },
    }),
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadAudio(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const audioUrl = `/uploads/audio/${file.filename}`;
    return this.wordsService.updateAudio(id, audioUrl);
  }
}
