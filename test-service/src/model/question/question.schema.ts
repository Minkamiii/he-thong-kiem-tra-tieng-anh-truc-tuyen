import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type QuestionDocument = Question & Document;

export enum QuestionType{
    CHOICE = 'choice',
    FILL = 'fill',
    ESSAY = 'essay'
}

@Schema({discriminatorKey: 'type', collection: 'question'})
export class Question{

    @Prop({required: false})
    question: string; //Phần đề bài của câu hỏi

    // @Prop({
    //     type: String,
    //     required: true,
    //     enum: QuestionType,
    // })
    // type: QuestionType; //Loại câu hỏi
    
}

export const QuestionSchema = SchemaFactory.createForClass(Question);