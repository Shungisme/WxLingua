import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { CreateRadicalDto } from '../../../core/dtos/radicals/create-radical.dto';

@Injectable()
export class RadicalsService {
  constructor(private prisma: PrismaService) {}

  create(createRadicalDto: CreateRadicalDto) {
    return this.prisma.radical.create({
      data: createRadicalDto,
    });
  }

  findAll(limit: number = 50) {
    return this.prisma.radical.findMany({
      take: limit,
      orderBy: { strokeCount: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.radical.findUnique({
      where: { id },
    });
  }
}
