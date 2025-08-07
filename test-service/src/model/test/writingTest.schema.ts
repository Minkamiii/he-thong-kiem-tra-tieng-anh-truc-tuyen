import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { Test } from "./test.schema";
import { Question } from "../question/question.schema";

export type WritingTestDocument = WritingTest & Document;

@Schema({_id: false})
export class WritingTaskSectionQuestion{
    
    @Prop({
        type: Number,
        required: true
    })
    //Lưu lại index câu hỏi của câu hiện tại trong đề hiện tại
    index: number
    
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Question.name,
        required: true
    })
    //Câu hỏi
    question: Types.ObjectId;
    
}

@Schema({_id: false})
export class WritingTaskSection{
    
    @Prop({
        type: Object,
        ref: WritingTaskSectionQuestion.name,
        required: true
    })
    //Mỗi writing section chỉ có 1 câu hỏi duy nhất, tuy nhiên để dạng mảng để có thể dễ viết DTO hơn
    questions: WritingTaskSectionQuestion[];
    
}

@Schema({_id: false})
export class WritingTask{
    
    @Prop({
        type: Object,
        ref: WritingTaskSection.name,
        required: true,
    })
    //Mỗi task bài writing chỉ có 1 section, tuy nhiên để dạng mảng để có thể dễ viết DTO hơn
    sections: WritingTaskSection[]

}

@Schema()
export class WritingTest extends Test{

    @Prop({
        type: [Object],
        ref: WritingTask.name,
        required: true,
    })
    tasks: WritingTask[];

}

export const WritingTestSchema = SchemaFactory.createForClass(WritingTest);