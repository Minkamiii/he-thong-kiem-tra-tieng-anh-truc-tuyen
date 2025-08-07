import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateIf, ValidateNested } from "class-validator";
import { QuestionType } from "src/model/question/question.schema";

class ChoiceItem{

    @IsString()
    @IsNotEmpty()
    text: string;

    @IsNumber()
    @Min(0)
    initialChoiceIndex: number;

}

export class CreateQuestionDTO{

    @IsString()
    @IsNotEmpty()
    question: string;

    @IsEnum(QuestionType)
    type: QuestionType;

    @ValidateIf((options) => options.object.type === QuestionType.CHOICE)
    @IsArray()
    @ArrayNotEmpty()
    @IsObject({each: true})
    @Type(() => ChoiceItem)
    choices?: ChoiceItem[]; //Những lựa chọn cho dạng choice

    @ValidateIf((options) => options.object.type === QuestionType.CHOICE)
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsNumber({}, {each: true})
    @Min(0, {each: true})
    keys?: number[]; //Những đáp án đúng cho dạng choice


    @ValidateIf((options) => options.object.type === QuestionType.FILL)
    @IsString()
    @IsNotEmpty()
    key?: string; //Đáp án đúng cho dạng fill

}