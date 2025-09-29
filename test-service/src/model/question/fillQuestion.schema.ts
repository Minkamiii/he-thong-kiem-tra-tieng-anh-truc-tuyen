import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Question } from "./question.schema";
import { ApiSchema } from "@nestjs/swagger";

export type FillQuestionDocument = FillQuestion & Document;

@Schema()
@ApiSchema({name: "Fill question schema"})
export class FillQuestion extends Question{

    @Prop({required: true})
    key: string;

}

export const FillQuestionSchema = SchemaFactory.createForClass(FillQuestion);