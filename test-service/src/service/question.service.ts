import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateQuestionDTO } from 'src/dto/question/create/create-question.dto';
import { UpdateQuestionDTO } from 'src/dto/question/update/update-question.dto';
import { ChoiceItem } from 'src/model/question/choiceQuestion.schema';
import { Question, QuestionDocument, QuestionType } from 'src/model/question/question.schema';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    ) {}

    objectId(id: string){
        return new Types.ObjectId(id);
    }

    async createQuestion(createQuestionDTO: CreateQuestionDTO): Promise<QuestionDocument> {
        //Luôn thêm mới câu hỏi vào DB
        const createdQuestion = new this.questionModel(createQuestionDTO);
        return createdQuestion.save();
    }

    async updateQuestion(id: string, updateQuestionDTO: UpdateQuestionDTO): Promise<QuestionDocument | null>{
        
        const foundQuestion = await this.questionModel.findById(this.objectId(id)).exec();
        if(!foundQuestion){
            throw new NotFoundException("Question with id " + id + " not found");
        }

        const updatedQuestion = {...updateQuestionDTO};

        switch(updateQuestionDTO.type){
            //Nếu câu hỏi là dạng Choice
            case QuestionType.CHOICE:
                const choiceItems: any[] = [];
                const keys: number[] = [];
                
                updateQuestionDTO.choices?.forEach((choice, index) => {
                    choiceItems.push(
                        {
                            ...choice,
                            initialChoiceIndex: index
                        }
                    );
                })

                updateQuestionDTO.keys?.forEach((key) => {
                    keys.push(key);
                })

                foundQuestion.set({
                    choices: choiceItems,
                    keys: keys
                })

                break;
            //Nếu câu hỏi là dạng fill
            case QuestionType.FILL:

                foundQuestion.set({
                    key: updateQuestionDTO.key
                })

                break;

        }
        
        return await foundQuestion.save();
    }

    async deleteQuestion(id: string): Promise<void> {
        await this.questionModel.findByIdAndDelete(id).exec();
    }
    
}