import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiSchema } from "@nestjs/swagger";
import { Document } from "mongoose";

export type TestDocument = Test & Document;

export enum TestType{
    READING = 'reading',
    LISTENING = 'listening',
    WRITING = 'writing',
}

//Timestamps dùng để thêm các trường created_at, updated_at
//Tên collection (bảng) là test
//Phân biệt các loại đề thông qua trường type (Không được định nghĩa Prop vì Mongo sẽ không hiểu type là dùng để discriminate)
@Schema({timestamps: true, collection: 'test', discriminatorKey: 'type'})
export class Test{
    
    // @Prop({
    //     type: String,
    //     required: true,
    //     enum: TestType,
    // })
    // type: TestType;

}

export const TestSchema = SchemaFactory.createForClass(Test);