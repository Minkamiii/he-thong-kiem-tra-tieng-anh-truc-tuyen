import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateIf, ValidateNested } from "class-validator";
import { TestType } from "src/model/test/test.schema";
import { UpdateQuestionDTO } from "src/dto/question/update/update-question.dto";
import { ApiProperty } from "@nestjs/swagger";

class TestTaskSectionQuestionDTO{

    @IsNumber()
    @Min(0)
    @ApiProperty({
        type: Number,
        minimum: 0,
        description: "Số thứ tự của câu hỏi trong đề (đầu tiên là 0)",
        example: "0"
    })
    index: number;
    
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateQuestionDTO)
    @ApiProperty({
        type: UpdateQuestionDTO,
    })
    question: UpdateQuestionDTO;

}

class TestTaskSectionDTO{

    @ValidateIf((options) => options.object.type === TestType.READING || options.object.type === TestType.LISTENING)
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        required: false,
        description: "Lưu lại Markdown của đề bài từng section được nhập vào",
        example: "_Complete the sentences below. Choose_ _**NO MORE THAN THREE WORDS**_ _from the text for each answer. Write your answers in_ _**boxes 1-8**_ _on your answer sheet._"
    })
    title?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsObject({each: true})
    @Type(() => TestTaskSectionQuestionDTO)
    @ApiProperty({
        type: TestTaskSectionQuestionDTO,
        isArray: true,
    })
    questions: TestTaskSectionQuestionDTO[]

}

class TestTaskDTO{

    @ValidateIf((options) => options.object.type === TestType.READING)
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        required: false,
        description: "Lưu lại Markdown của đoạn văn được nhập vào",
        example: "Nothing beats a jet2 holiday and right now you can save **£50** per person. that's £200 off for a family of 4. We've got **millions of free child place holidays** available with 22kg of baggage included. Book now with jet2holidays. _**Package holidays you can trust**_!"
    })
    passage?: string;

    @ValidateIf((options) => options.object.type === TestType.LISTENING)
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        required: false,
        description: "Lưu lại link dẫn tới file audio nằm ở trong static dir",
        example: "http://[::1]:8000/uploads/listening/test.mp3"
    })
    audio?: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => TestTaskSectionDTO)
    @ApiProperty({
        type: TestTaskSectionDTO,
        isArray: true,
    })
    sections: TestTaskSectionDTO[];

}

export class UpdateTestDTO{

    @IsEnum(TestType)
    @ApiProperty({
        enum: TestType,
        type: String,
        examples: {
            LISTENING: {value: TestType.LISTENING},
            READING: {value: TestType.READING},
            WRITING: {value: TestType.WRITING}
        }
    })
    type: TestType;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
    })
    testName?: String;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type((options) => TestTaskDTO)
    @ApiProperty({
        type: TestTaskDTO,
        isArray: true,
    })
    tasks: TestTaskDTO[];

}