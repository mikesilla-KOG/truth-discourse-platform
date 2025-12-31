import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('groups')
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    const ownerId = req.user.id;
    return this.groups.createGroup({ ...body, ownerId });
  }

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    return this.groups.findBySlug(slug);
  }
}
