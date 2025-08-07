import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { Question } from "./question.schema";

@Schema()
export class EssayQuestion extends Question{
    
}

export const EssayQuestionSchema = SchemaFactory.createForClass(EssayQuestion);