import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Question } from "./question.schema";

export type FillQuestionDocument = FillQuestion & Document;

@Schema()
export class FillQuestion extends Question{

    @Prop({required: true})
    key: string;

}

export const FillQuestionSchema = SchemaFactory.createForClass(FillQuestion);