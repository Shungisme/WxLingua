import {
  Body,
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Post,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { DictionaryService } from '../services/dictionary.service';
import { SearchDictionaryDto } from '../../../core/dtos/dictionary/search-dictionary.dto';
import { RecognizeHandwritingDto } from '../../../core/dtos/dictionary/recognize-handwriting.dto';
import { HandwritingService } from '../services/handwriting.service';
import { Public } from '../../../core/decorators/public.decorator';
import { handleControllerException } from '../../../shared/utils/response.util';

@Controller('dictionary')
export class DictionaryController {
  private readonly logger = new Logger(DictionaryController.name);

  constructor(
    private readonly dictionaryService: DictionaryService,
    private readonly handwritingService: HandwritingService,
  ) {}

  @Public()
  @Get('search')
  async search(@Query(ValidationPipe) searchDto: SearchDictionaryDto) {
    try {
      return await this.dictionaryService.search(searchDto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'search',
      });
    }
  }

  @Public()
  @Post('handwriting/recognize')
  async recognizeHandwriting(
    @Body(ValidationPipe) recognizeDto: RecognizeHandwritingDto,
  ) {
    try {
      return await this.handwritingService.recognize(recognizeDto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'recognizeHandwriting',
      });
    }
  }

  @Public()
  @Get('word/:id')
  async getWord(@Param('id') id: string) {
    try {
      const word = await this.dictionaryService.getWordById(id);
      if (!word) {
        throw new NotFoundException(`Word with ID ${id} not found`);
      }
      return word;
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getWord',
      });
    }
  }

  @Public()
  @Get('radical/:char')
  async getRadical(@Param('char') char: string) {
    try {
      const radical = await this.dictionaryService.getRadicalByChar(char);
      if (!radical) {
        throw new NotFoundException(`Radical ${char} not found`);
      }
      return radical;
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'getRadical',
      });
    }
  }

  @Public()
  @Get('radicals')
  async listRadicals(@Query('limit') limit?: number) {
    try {
      return await this.dictionaryService.listRadicals(limit);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'listRadicals',
      });
    }
  }
}
