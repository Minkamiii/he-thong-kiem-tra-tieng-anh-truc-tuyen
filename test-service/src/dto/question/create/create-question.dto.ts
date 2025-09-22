import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateIf, ValidateNested } from "class-validator";
import { QuestionType } from "src/model/question/question.schema";

export class ChoiceItem{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: "Phần text của đáp án, được lưu bằng Markdown",
        example: "_**TRUE**_"
    })
    text: string;

    @IsNumber()
    @Min(0)
    @ApiProperty({
        type: Number,
        minimum: 0,
        required: false,
        description: "là Index ban đầu của đáp án, được dùng để làm phần so sánh đáp án đúng và có thể dùng được kể cả khi đáp án đã bị trộn (ví dụ ban đầu là đáp án A được trộn sang C thì initialChoiceIndex sẽ là 0)",
        example: 0
    })
    initialChoiceIndex?: number;

}

export class CreateQuestionDTO{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: "Đề bài của câu hỏi lưu bằng Markdown (Trường hợp là dạng Fill thì có thể để trống)",
        example: "Quotes are given with (1) \_\_\_\_\_\_\_\_ to buy."
    })
    question: string;

    @IsEnum(QuestionType)
    @ApiProperty({
        enum: QuestionType,
        type: String,
        examples: {
            CHOICE: {value: QuestionType.CHOICE},
            FILL: {value: QuestionType.FILL},
            ESSAY: {value: QuestionType.ESSAY}
        } 
    })
    type: QuestionType;

    @ValidateIf((options) => options.object.type === QuestionType.CHOICE)
    @IsArray()
    @ArrayNotEmpty()
    @IsObject({each: true})
    @Type(() => ChoiceItem)
    @ApiProperty({
        type: ChoiceItem,
        isArray: true,
        required: false,
    })
    choices?: ChoiceItem[]; //Những lựa chọn cho dạng choice

    @ValidateIf((options) => options.object.type === QuestionType.CHOICE)
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsNumber({}, {each: true})
    @Min(0, {each: true})
    @ApiProperty({
        type: Number,
        isArray: true,
        required: false,
        description: "Lưu lại INITIAL INDEX của đáp án đúng (Ví dụ đáp án A B C D đáp án A đúng thì keys là 0)",
        example: [0]
    })
    keys?: number[]; //Những đáp án đúng cho dạng choice


    @ValidateIf((options) => options.object.type === QuestionType.FILL)
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        required: false,
        description: "Lưu lại đáp án đúng cho dạng fill, không cần phải chuyển về uppercase hay lowercase, không cần phải là markdown",
        example: "Cooperation"
    })
    key?: string; //Đáp án đúng cho dạng fill

}