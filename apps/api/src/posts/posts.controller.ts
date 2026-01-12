import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('posts')
export class PostsController {
  constructor(private posts: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    return this.posts.createPost({ authorId: req.user.id, ...body });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.posts.getPost(Number(id));
  }

  @Post(':id/react')
  async react(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const user = req.user;
    return this.posts.reactPost(Number(id), body.type || 'agree', user?.id);
  }

  @Get('/')
  async feed() {
    return this.posts.feedForUser(0);
  }
}
