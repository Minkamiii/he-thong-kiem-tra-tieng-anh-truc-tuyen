import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsString, Min } from "class-validator";

class TestTask{

    @IsNumber()
    @Min(0)
    @ApiProperty({
        type: Number,
        minimum: 0,
    })
    index: number; //Vị trí của task trong mảng tasks của đề gốc
    
}

export class GetAllQuestionByTestIDDTO{

    @IsArray()
    @ArrayNotEmpty()
    @IsObject({each: true})
    @Type(() => TestTask)
    @ApiProperty({
        type: TestTask,
        isArray: true
    })
    tasks: TestTask[];
}