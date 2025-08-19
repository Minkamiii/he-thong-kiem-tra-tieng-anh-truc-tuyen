import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { Test } from "./test.schema";
import { Question } from "../question/question.schema";
import { ApiSchema } from "@nestjs/swagger";

export type ReadingTestDocument = ReadingTest & Document;

@Schema({_id: false})
class ReadingTaskSectionQuestion{

    @Prop({
        type: Number,
        required: true,
    })
    //Lưu lại index câu hỏi của câu hiện tại trong đề hiện tại
    index: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Question.name,
        required: true,
    })
    //Câu hỏi
    question: Types.ObjectId;

}

@Schema({_id: false})
class ReadingTaskSection{

    @Prop({
        type: String,
        required: true,
    })
    //Lưu lại đề bài của section này dưới dạng MarkDown để có thể dễ dàng hiển thị nội dung. (Bắt buộc phải là MarkDown)
    title: string;

     @Prop({
        type: [ReadingTaskSectionQuestion],
        required: true
    })
    //Mỗi section có nhiều câu hỏi
    questions: ReadingTaskSectionQuestion[]

}

@Schema({_id: false})
class ReadingTask{

    @Prop({required: true})
    //Đoạn văn (Lưu MarkDown để có thể dynamic được những text khác nhau)
    passage: string;

    @Prop({
        type: [ReadingTaskSection],
        required: true
    })
    //Mỗi một bài reading có nhiều section khác nhau tương ứng với 1 đề bài
    sections: ReadingTaskSection[];

}

@Schema()
@ApiSchema({name: "Reading test schema"})
export class ReadingTest extends Test{

    @Prop({
        type: [ReadingTask],
        required: true,
    })
    //Một bài reading test có nhiều passage
    tasks: ReadingTask[];

}

export const ReadingTestSchema = SchemaFactory.createForClass(ReadingTest);