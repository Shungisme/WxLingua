import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { SearchDictionaryDto } from './dto/search-dictionary.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Public()
  @Get('search')
  async search(@Query(ValidationPipe) searchDto: SearchDictionaryDto) {
    return await this.dictionaryService.search(searchDto);
  }

  @Public()
  @Get('word/:id')
  async getWord(@Param('id') id: string) {
    const word = await this.dictionaryService.getWordById(id);
    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }
    return word;
  }

  @Public()
  @Get('radical/:char')
  async getRadical(@Param('char') char: string) {
    const radical = await this.dictionaryService.getRadicalByChar(char);
    if (!radical) {
      throw new NotFoundException(`Radical ${char} not found`);
    }
    return radical;
  }

  @Public()
  @Get('radicals')
  async listRadicals(@Query('limit') limit?: number) {
    return await this.dictionaryService.listRadicals(limit);
  }
}
