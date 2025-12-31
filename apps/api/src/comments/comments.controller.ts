import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('comments')
export class CommentsController {
  constructor(private comments: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    const authorId = req.user.id;
    return this.comments.createComment({ authorId, postId: body.postId, content: body.content, parentId: body.parentId });
  }

  @Get('/post/:postId')
  async listForPost(@Param('postId') postId: string) {
    return this.comments.listForPost(Number(postId));
  }
}
