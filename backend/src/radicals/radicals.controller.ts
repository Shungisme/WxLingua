import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RadicalsService } from './radicals.service';
import { CreateRadicalDto } from './dto/create-radical.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Radicals')
@Controller('radicals')
export class RadicalsController {
  constructor(private readonly radicalsService: RadicalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new radical' })
  create(@Body() createRadicalDto: CreateRadicalDto) {
    return this.radicalsService.create(createRadicalDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all radicals' })
  findAll(@Query('limit') limit: string) {
    return this.radicalsService.findAll(limit ? +limit : 50);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a radical by ID' })
  findOne(@Param('id') id: string) {
    return this.radicalsService.findOne(id);
  }
}
