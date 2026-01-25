import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { CommentService } from "./service/comment.service";
import { AddCommentDTO } from "./dto/addComment.dto";
import { UpdateCommentDTO } from "./dto/updateComment.dto";

@Controller('/api/comment')
export class CommentController{

    constructor(
        private readonly commentService: CommentService,
    ){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    AddNewComment(@Body() addCommentDTO: AddCommentDTO){
        return this.commentService.AddNewComment(addCommentDTO);
    }

    @Put(':cmt')
    @HttpCode(HttpStatus.OK)
    UpdateComment(@Param('cmt') cmtId: string, @Body() updateCommentDTO: UpdateCommentDTO){
        return this.commentService.UpdateComment(cmtId, updateCommentDTO);
    }

    @Delete(':cmt')
    @HttpCode(HttpStatus.NO_CONTENT)
    DeleteOneComment(@Param('cmt') cmtId: string){
        return this.commentService.DeleteOneComment(cmtId);
    }

    @Delete('/test/:t')
    @HttpCode(HttpStatus.NO_CONTENT)
    DeleteAllTestComments(@Param('t') testId: string){
        return this.commentService.DeleteAllCommentsByTest(testId);
    }

    @Get(':t')
    @HttpCode(HttpStatus.OK)
    GetAllCommentsByTest(@Param('t') testId: string){
        return this.commentService.GetAllCommentsByTest(testId);
    }
}