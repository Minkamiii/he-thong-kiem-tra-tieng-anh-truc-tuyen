import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDateString, IsMongoId, IsNotEmpty, IsObject, IsString } from "class-validator";

export class CommentItemDTO{

    @IsMongoId()
    commentId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsDateString()
    createdAt: string;

    @IsDateString()
    updatedAt: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsObject({ each: true })
    @Type(() => CommentItemDTO)
    replies?: CommentItemDTO[];

}

export class GetAllCommentResponseDTO{

    @IsMongoId()
    testId: string;

    @IsArray()
    @IsObject({ each: true })
    @Type(() => CommentItemDTO)
    comments: CommentItemDTO[];

}