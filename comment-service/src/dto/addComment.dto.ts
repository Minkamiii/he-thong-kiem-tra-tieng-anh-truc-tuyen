import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddCommentDTO{

    @IsMongoId()
    testId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsMongoId()
    parentId?: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

}