import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { RadicalsService } from '../services/radicals.service';
import { CreateRadicalDto } from '../../../core/dtos/radicals/create-radical.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { handleControllerException } from '../../../shared/utils/response.util';

@ApiTags('Radicals')
@Controller('radicals')
export class RadicalsController {
  private readonly logger = new Logger(RadicalsController.name);

  constructor(private readonly radicalsService: RadicalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new radical' })
  async create(@Body() createRadicalDto: CreateRadicalDto) {
    try {
      return await this.radicalsService.create(createRadicalDto);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'create',
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all radicals' })
  async findAll(@Query('limit') limit: string) {
    try {
      return await this.radicalsService.findAll(limit ? +limit : 50);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'findAll',
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a radical by ID' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.radicalsService.findOne(id);
    } catch (error) {
      return handleControllerException({
        error,
        logger: this.logger,
        context: 'findOne',
      });
    }
  }
}
