import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsString, Min, ValidateIf, ValidateNested } from "class-validator";
import { TestType } from "src/model/test/test.schema";
import { UpdateQuestionDTO } from "src/dto/question/update/update-question.dto";

class TestTaskSectionQuestionDTO{

    @IsNumber()
    @Min(0)
    index: number;
    
    @IsObject()
    @ValidateNested()
    @Type(() => UpdateQuestionDTO)
    question: UpdateQuestionDTO;

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

export class UpdateTestDTO{

    @IsEnum(TestType)
    type: TestType;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({each: true})
    @Type((options) => TestTaskDTO)
    tasks: TestTaskDTO[];

}