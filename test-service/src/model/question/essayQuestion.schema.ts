import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { Question } from "./question.schema";
import { ApiSchema } from "@nestjs/swagger";

@Schema()
@ApiSchema({name: "Essay question schema"})
export class EssayQuestion extends Question{
    
}

export const EssayQuestionSchema = SchemaFactory.createForClass(EssayQuestion);