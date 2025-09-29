import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { Test } from "./test.schema";
import { Question } from "../question/question.schema";
import { ApiSchema } from "@nestjs/swagger";

export type ReadingTestDocument = ListeningTest & Document;

@Schema({_id: false})
class ListeningTaskSectionQuestion{
    
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
class ListeningTaskSection{
    
    @Prop({
        type: String,
        required: true,
    })
    //Lưu lại đề bài của section này dưới dạng MarkDown để có thể dễ dàng hiển thị nội dung
    title: string;
    
    @Prop({
        type: [ListeningTaskSectionQuestion],
        required: true
    })
    //Mỗi section có nhiều câu hỏi
    questions: ListeningTaskSectionQuestion[]
    
}

@Schema({_id: false})
class ListeningTask{

    @Prop({required: true})
    //Lưu lại file path của audio file
    audio: string;

    @Prop({
        type: [ListeningTaskSection],
        required: true
    })
    //Mỗi một bài lisening có nhiều section khác nhau tương ứng với 1 đề bài
    sections: ListeningTaskSection[];

}

@Schema()
@ApiSchema({name: "Listening test schema"})
export class ListeningTest extends Test{
    
    @Prop({
        type: [ListeningTask],
        required: true
    })
    tasks: ListeningTask[];

}

export const ListeningTestSchema = SchemaFactory.createForClass(ListeningTest);