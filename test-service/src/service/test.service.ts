import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTestDTO } from 'src/dto/test/create/create-test.dto';
import { UpdateTestDTO } from 'src/dto/test/update/update-test.dto';
import { Test, TestDocument, TestType } from 'src/model/test/test.schema';
import { QuestionService } from './question.service';

@Injectable()
export class TestService {

    constructor(
        @InjectModel(Test.name) private testModel: Model<TestDocument>,
        private readonly questionService: QuestionService,
    ) {}

    objectId(id: string){
        return new Types.ObjectId(id);
    }

    async createTest(createTestDTO: CreateTestDTO): Promise<TestDocument> {
        const testData = JSON.parse(JSON.stringify(createTestDTO));

        for(const task of testData.tasks){
            for(const section of task.sections){
                for(const question of section.questions){
                    //Thêm mới question vào collecion 'question'
                    const createdQuestion = await this.questionService.createQuestion(question.question);

                    //Thay đổi trường question thành id thay vì là model Question
                    question.question = createdQuestion._id;
                }
            }   
        }

        //Thêm vào collection
        const createdTest = await this.testModel.create(testData);
        return createdTest;
    }

    async findAll(): Promise<TestDocument[]> {
        return this.testModel.find().exec();
    }

    async findById(id: string): Promise<TestDocument | null> {
        return this.testModel.findById(id).populate({ path: 'tasks.sections.questions.question' }).exec();
    }

    async findByType(type: TestType): Promise<TestDocument[]> {
        return this.testModel.find({ type }).exec();
    }

    async findByIdAndDelete(id: string): Promise<void> {

        const foundTest = await this.testModel.findById(id).exec() as any;
        if(!foundTest){
            throw new NotFoundException("Test with id " + id + " not found");
        }

        for(const task of foundTest.tasks){
            for(const section of task.sections){
                for(const question of section.questions){
                    await this.questionService.deleteQuestion(question.question._id);
                }
            }
        }

        await this.testModel.findByIdAndDelete(id).exec();
    }

    async findByIdAndUpdate(id: string, updateTestDTO: UpdateTestDTO): Promise<TestDocument | null> {

        const foundTest = await this.testModel.findById(id).exec();
        if(!foundTest){
            throw new NotFoundException("Test with id " + id + " not found");
        }

        const updatedTasks: any[] = [];
        
        for(const task of updateTestDTO.tasks){
            const updatedSections: any[] = [];

            for(const section of task.sections){
                const updatedQuestions: any[] = [];

                for(const question of section.questions){
                    const updatedQuestion = await this.questionService.updateQuestion(question.question._id, question.question);
                    updatedQuestions.push(
                        {
                            index: question.index,
                            question: this.objectId(question.question._id)
                        }
                    );

                }

                updatedSections.push(
                    {
                        ...section,
                        questions: updatedQuestions
                    }
                );
            }

            updatedTasks.push(
                {
                    ...task,
                    sections: updatedSections
                }
            );
        }

        foundTest.set({
            type: updateTestDTO.type,
            tasks: updatedTasks,
        })

        return await foundTest.save();
        
    }
}