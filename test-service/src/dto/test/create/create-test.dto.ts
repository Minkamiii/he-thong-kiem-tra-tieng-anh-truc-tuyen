import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateIf, ValidateNested } from "class-validator";
import { CreateQuestionDTO } from "src/dto/question/create/create-question.dto";
import { TestType } from "src/model/test/test.schema";

class TestTaskSectionQuestionDTO{

    @IsNumber()
    @Min(0)
    index: number;
    
    @IsObject()
    @ValidateNested()
    @Type(() => CreateQuestionDTO)
    question: CreateQuestionDTO;

}

class TestTaskSectionDTO{

    @ValidateIf((options) => options.object.type === TestType.READING || options.object.type === TestType.LISTENING)
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsObject({each: true})
    @Type(() => TestTaskSectionQuestionDTO)
    questions: TestTaskSectionQuestionDTO[]

}

class TestTaskDTO{

    @ValidateIf((options) => options.object.type === TestType.READING)
    @IsString()
    @IsNotEmpty()
    passage?: string;

    @ValidateIf((options) => options.object.type === TestType.LISTENING)
    @IsString()
    @IsNotEmpty()
    audio?: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => TestTaskSectionDTO)
    sections: TestTaskSectionDTO[];

}

export class CreateTestDTO{

    @IsEnum(TestType)
    type: TestType;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type(() => TestTaskDTO)
    tasks: TestTaskDTO[];

}