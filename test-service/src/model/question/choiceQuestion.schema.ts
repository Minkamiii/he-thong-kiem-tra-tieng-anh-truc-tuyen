import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Question } from "./question.schema";
import { ApiSchema } from "@nestjs/swagger";

export type ChoiceQuestionDocument = ChoiceQuestion & Document;

@Schema({ _id: false }) // Thêm option này để Mongoose không tự tạo _id cho sub-document
export class ChoiceItem{

    @Prop({required: true})
    text: string; //Phần chữ của đáp án

    @Prop({required: true})
    initialChoiceIndex: number; // Index ban đầu của đáp án khi khởi tạo

}

export const ChoiceItemSchema = SchemaFactory.createForClass(ChoiceItem);

@Schema()
@ApiSchema({name: "Choice question schema"})
export class ChoiceQuestion extends Question{

    @Prop({
        type: [ChoiceItemSchema], // Sử dụng schema đã định nghĩa ở trên
        required: true, 
    })
    choices: ChoiceItem[];

    @Prop({type: [Number] , required: true})
    keys: number[]; // Mảng chứa các `initialChoiceIndex` của đáp án đúng

}

export const ChoiceQuestionSchema = SchemaFactory.createForClass(ChoiceQuestion);