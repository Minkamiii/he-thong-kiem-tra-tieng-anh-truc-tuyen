import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateIf } from "class-validator";
import { QuestionType } from "src/model/question/question.schema";

class ChoiceItem{

    @IsString()
    @IsNotEmpty()
    text?: string;

    @IsNumber()
    @Min(0)
    initialChoiceIndex?: number;

}

export class UpdateQuestionDTO{

    @IsMongoId()
    _id: string;

    @IsString()
    @IsNotEmpty()
    question?: string;

    @IsEnum(QuestionType)
    type: QuestionType;

    @ValidateIf((options) => options.object.type === QuestionType.CHOICE)
    @IsArray()
    @ArrayNotEmpty()
    @IsObject({each: true})
    @Type(() => ChoiceItem)
    choices?: ChoiceItem[]; 

    @ValidateIf((options) => options.object.type === QuestionType.CHOICE)
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsNumber({}, {each: true})
    @Min(0, {each: true})
    keys?: number[];

    @ValidateIf((options) => options.object.type === QuestionType.FILL)
    @IsString()
    @IsNotEmpty()
    key?: string;

}