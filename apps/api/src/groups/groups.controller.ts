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

  @Get()
  async list() {
    return this.groups.list();
  }

  @Post(':slug/join')
  @UseGuards(JwtAuthGuard)
  async join(@Param('slug') slug: string, @Req() req: any) {
    return this.groups.joinGroup(slug, req.user.id);
  }

  @Post(':slug/leave')
  @UseGuards(JwtAuthGuard)
  async leave(@Param('slug') slug: string, @Req() req: any) {
    return this.groups.leaveGroup(slug, req.user.id);
  }

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    return this.groups.findBySlug(slug);
  }
}
