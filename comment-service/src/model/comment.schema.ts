import { Prop, Schema ,SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";

export type CommentDocument = Comment & Document;

@Schema({timestamps: true, collection: 'comment'})
export class Comment{

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    })
    testId: Types.ObjectId;
    
    @Prop({
        type: String,
        required: true,
    })
    content: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Comment.name,
        required: false,
    })
    parentId?: Types.ObjectId; //Nếu như comment được reply từ comment khác thì sẽ có trường parentId chính là _id của comment được trả lời

    @Prop({
        type: String,
        required: true
    })
    userId: string;

}

export const CommentSchema = SchemaFactory.createForClass(Comment);