import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { AddWordsToDeckDto } from './dto/add-words.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Decks')
@Controller('decks')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DecksController {
    constructor(private readonly decksService: DecksService){}
    @Post()
    create(@Request() req, @Body() dto: CreateDeckDto) {
        return this.decksService.create(req.user.id, dto);
    }
    @Get()
    findAll(@Request() req, @Query() query: any) {
        return this.decksService.findAll(req.user.id, query);
    }
    @Post(':id/words')
    addWords(@Request() req, @Param('id') id: string, @Body() dto: AddWordsToDeckDto) {
        return this.decksService.addWords(req.user.id, id, dto.wordIds);
    }
    @Get(':id/cards')
    findOne(@Param('id') id: string){ 
        return this.decksService.findOne(id);
    }
}
