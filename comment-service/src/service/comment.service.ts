import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToInstance } from "class-transformer";
import { Model, Types } from "mongoose";
import { AddCommentDTO } from "src/dto/addComment.dto";
import { CommentItemDTO, GetAllCommentResponseDTO } from "src/dto/getAllCommentResponse.dto";
import { UpdateCommentDTO } from "src/dto/updateComment.dto";
import { Comment, CommentDocument } from "src/model/comment.schema";

@Injectable()
export class CommentService{
    constructor(
        @InjectModel(Comment.name) private commentModel : Model<Comment>,
    ){}

    objectId(id: string){
        return new Types.ObjectId(id);
    }

    async AddNewComment(addCommentDTO: AddCommentDTO): Promise<CommentDocument>{
        const newComment = new this.commentModel(addCommentDTO);
        return newComment.save();
    }

    async UpdateComment(commentId: string, updateCommentDTO: UpdateCommentDTO): Promise<CommentDocument | null>{
        return await this.commentModel.findByIdAndUpdate(this.objectId(commentId), updateCommentDTO, {new: true});
    }

    // format date like dd/mm/yyyy hh:MM:ss
    private formatDate(date: Date): string{
        const d = new Date(date);
        const pad = (n: number) => (n < 10 ? '0' + n : n);

        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    private findRootComments(allComments: any[]): CommentItemDTO[] {

        const commentMap: Record<string, CommentItemDTO> = {};
        allComments.forEach(c => {
            commentMap[c._id.toString()] = {
                commentId: c._id.toString(),
                content: c.content,
                userId: c.userId,
                createdAt: this.formatDate(c.createdAt),
                updatedAt: this.formatDate(c.updatedAt),
                replies: []
            };
        });

        //Mapping để tạo những replies trong từng comment
        const rootComments: CommentItemDTO[] = [];
        allComments.forEach(c => {
            if(c.parentId){
                const parentComment = commentMap[c.parentId.toString()];
                if(parentComment){
                    parentComment.replies?.push(commentMap[c._id.toString()])
                }
            }
            else{
                rootComments.push(commentMap[c._id.toString()]);
            }
        })

        return rootComments;
    }

    async GetAllCommentsByTest(testId: string): Promise<GetAllCommentResponseDTO>{
        const allComments = await this.commentModel.find({testId: this.objectId(testId)}).sort({createdAt: -1}).lean();
        
        //Đưa toàn bộ comment vào một map với key là id của comment đó, value là comment
        const rootComments = this.findRootComments(allComments);

        return plainToInstance(GetAllCommentResponseDTO, {
            testId: testId,
            comments: rootComments,
        })
    }

    //Khi xoá một comment bất kỳ, tất cả những replies của nó cũng đều bị xóa
    async DeleteOneComment(deleteCommentId: string){
        const thisComment = await this.commentModel.findById(this.objectId(deleteCommentId));
        if(!thisComment){
            throw new HttpException(`Comment with id ${deleteCommentId} not found`, HttpStatus.NOT_FOUND);
        }

        const testId = thisComment.testId;
        const allComments = await this.commentModel.find({testId: testId}).lean();

        const rootComments = this.findRootComments(allComments);

        const deleteCommentIds: Types.ObjectId[] = [];
        //Lấy toàn bộ deleteComment 
        for(const rootComment of rootComments){
            if(rootComment.commentId === deleteCommentId){
                deleteCommentIds.push(this.objectId(rootComment.commentId));
                if(rootComment.replies){

                    //Duyệt cây comment bằng DFS nếu comment đó có replies
                    const stack: CommentItemDTO[] = [...rootComment.replies];
                    while(stack.length > 0){
                        const current = stack.pop()!;
                        deleteCommentIds.push(this.objectId(current.commentId));

                        if(current.replies){
                            current.replies.forEach(r => {
                                stack.push(r);
                            })
                        }
                    }
                }
                break;
            }
        }

        const result = await this.commentModel.deleteMany({
            _id: {
                $in: deleteCommentIds,
            }
        })

        return {
            statusCode: HttpStatus.OK,
            message: `Delete ${result.deletedCount} comments successfully`,
        }
    }

    //Xoá toàn bộ comment của test đó chỉ khi test bị xóa
    async DeleteAllCommentsByTest(testId: string){
        const result = await this.commentModel.deleteMany({testId: this.objectId(testId)});
        if(result.deletedCount === 0){
            throw new HttpException(`No comment found for test with id ${testId}`, HttpStatus.NOT_FOUND);
        }
        else{
            return {
                statusCode: HttpStatus.OK,
                message: `Delete ${result.deletedCount} comments successfully`,
            }
        }
    }

}