import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateQuestionDTO } from 'src/dto/question/create/create-question.dto';
import { UpdateQuestionDTO } from 'src/dto/question/update/update-question.dto';
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

    async bulkCreateQuestions(createQuestionDTO: CreateQuestionDTO[]): Promise<QuestionDocument[]> {
        return this.questionModel.insertMany(createQuestionDTO);
    }

    async updateQuestion(id: string, updateQuestionDTO: UpdateQuestionDTO): Promise<QuestionDocument | null>{
        
        const foundQuestion = await this.questionModel.findById(this.objectId(id)).exec();
        if(!foundQuestion){
            throw new HttpException({statusCode: HttpStatus.NOT_FOUND, message: `Question with id ${id} not found`}, HttpStatus.NOT_FOUND)
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
    
    async bulkUpdateQuestions(updateQuestions: {id: string, updateQuestionDTO: UpdateQuestionDTO}[]): Promise<any>{
        const updatedQuestions = updateQuestions.map(({id, updateQuestionDTO}) => {
            let updatePayload: any = {};

            switch(updateQuestionDTO.type){
                case QuestionType.CHOICE:
                    const choiceItems = updateQuestionDTO.choices?.map((choice, index) => ({
                        ...choice,
                        initialChoiceIndex: index
                    }))

                    const keys = updateQuestionDTO.keys ?? [];

                    updatePayload = {
                        choices: choiceItems,
                        keys: keys
                    }

                    break;

                case QuestionType.FILL:
                    updatePayload = {
                        key: updateQuestionDTO.key
                    }
                    break;
            }

            return {
                updateOne: {
                    filter: {_id: this.objectId(id)},
                    update: {
                        $set: updatePayload
                    }
                }
            }
        })

        return this.questionModel.bulkWrite(updatedQuestions);
    }

    async deleteQuestion(id: string): Promise<void> {
        await this.questionModel.findByIdAndDelete(this.objectId(id)).exec();
    }

    async bulkDeleteQuestions(ids: string[]): Promise<void> {
        const objectIds = ids.map(id => this.objectId(id));

        await this.questionModel.deleteMany({
            _id: { $in: objectIds }
        })
    }

    async bulkFindQuestions(ids: string[]): Promise<QuestionDocument[]> {
        return this.questionModel.find({_id: {$in: ids}});
    }
    
}