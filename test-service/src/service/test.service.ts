import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTestDTO } from 'src/dto/test/create/create-test.dto';
import { UpdateTestDTO } from 'src/dto/test/update/update-test.dto';
import { Test, TestDocument, TestType } from 'src/model/test/test.schema';
import { QuestionService } from './question.service';
import { UpdateQuestionDTO } from 'src/dto/question/update/update-question.dto';
import { CacheService } from './cache.service';
import { GetAllQuestionByTestIDDTO } from 'src/dto/question/get/get-all-question.dto';
import { QuestionType } from 'src/model/question/question.schema';

@Injectable()
export class TestService {

    constructor(
        @InjectModel(Test.name) private testModel: Model<TestDocument>,
        private readonly questionService: QuestionService,
        private readonly cacheService: CacheService,
    ) {}

    private readonly PAGINATION_LIMIT_NUMBER_OF_ITEM = 12; //Tối đa 1 trang có 12 item

    objectId(id: string){
        return new Types.ObjectId(id);
    }

    async createTest(createTestDTO: CreateTestDTO): Promise<TestDocument> {
        const testData = JSON.parse(JSON.stringify(createTestDTO));

        const allQuestions: any[] = [];
        const questionPositions: {taskIndex: number, sectionIndex: number, questionIndex: number}[] = []

        //Duyệt toàn bộ test
        testData.tasks.forEach((task, taskIndex) => {
            task.sections.forEach((section, sectionIndex) => {
                section.questions.forEach((question, questionIndex) => {

                    if(testData.type === TestType.WRITING && question.question.type !== QuestionType.ESSAY)
                        throw new HttpException({statusCode: HttpStatus.BAD_REQUEST, message: 'Writing test must have essay question'}, HttpStatus.BAD_REQUEST)

                    if(testData.type !== TestType.WRITING && question.question.type === QuestionType.ESSAY)
                        throw new HttpException({statusCode: HttpStatus.BAD_REQUEST, message: `${testData.type} test can't have essay question`}, HttpStatus.BAD_REQUEST)

                    //Đặt initialIndex của từng câu trả lời dạng Choice (Type = CHOICE) là index của mảng đó
                    question.question.choices?.forEach((choice, index) => {
                        choice.initialChoiceIndex = index;
                    })

                    //Đưa vào một mảng khác để lấy sự cập nhật
                    allQuestions.push(question.question);

                    //Lưu lại vị trí để có thể thay đổi question.question thành ObjectID thay vì là CreateQuestionDTO
                    questionPositions.push({
                        taskIndex: taskIndex,
                        sectionIndex: sectionIndex,
                        questionIndex: questionIndex
                    })
                })
            })
        })

        //Bulk insert vào collection 'question'
        const insertedQuestions = await this.questionService.bulkCreateQuestions(allQuestions);

        //Thay đổi trường question trong section.questions thành objectID thay vì là CreateTestDTO
        questionPositions.forEach((pos, index) => {
            const insertedId = insertedQuestions[index]._id;
            testData.tasks[pos.taskIndex]
                    .sections[pos.sectionIndex]
                    .questions[pos.questionIndex]
                    .question = insertedId;
        })

        //Thêm vào collection
        const createdTest = await this.testModel.create(testData);

        await this.cacheService.del(`test:type:${testData.type}`); //Xóa cache cũ
        await this.cacheService.del('test:all') //Xoá cache cũ

        return createdTest;
    }

    async findAll(
        page: number = 1, 
        limit: number = this.PAGINATION_LIMIT_NUMBER_OF_ITEM
    ): Promise<{
        data: TestDocument[], 
        totalItems: number, 
        totalPages: number, 
        currentPage: number, 
        limit: number
    }> {
        const cacheData = await this.cacheService.get<{
            data: TestDocument[], 
            totalItems: number, 
            totalPages: number, 
            currentPage: number, 
            limit: number
        }>('test:all'); //Lấy data từ cache nếu có

        if(cacheData) return cacheData; //Nếu có data từ cache trả về luôn

        const skip = (page - 1) * limit;
        const totalItems = await this.testModel.countDocuments();
        const data = await this.testModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();

        const returnData = {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            limit
        };

        this.cacheService.set('test:all', returnData); //Lưu vào cache manager

        return returnData;
    }

    async findById(id: string): Promise<TestDocument | null> {
        const cacheData = await this.cacheService.get<TestDocument>(`test:${id}`); //Lấy data từ cache nếu có

        if(cacheData){
            return cacheData; //Nếu có data từ cache trả về luôn
        }

        const data = await this.testModel.findById(id).populate({ path: 'tasks.sections.questions.question' }).exec();

        if(!data){
            throw new HttpException({statusCode: HttpStatus.NOT_FOUND, message: `Test with id ${id} not found`}, HttpStatus.NOT_FOUND);
        }
        
        this.cacheService.set(`test:${id}`, data); //Lưu vào cache service

        return data;
    }

    async findByType(
        type: TestType, 
        page: number = 1, 
        limit: number = this.PAGINATION_LIMIT_NUMBER_OF_ITEM
    ): Promise<{
        data: TestDocument[],
        totalItems: number,
        totalPages: number,
        currentPage: number,
        limit: number
    }> {
        const cacheData = await this.cacheService.get<{
            data: TestDocument[],
            totalItems: number,
            totalPages: number,
            currentPage: number,
            limit: number
        }>(`test:type:${type}`)

        if(cacheData) return cacheData; //Nếu có data từ cache trả về luôn

        const skip = (page - 1) * limit;
        const totalItems = await this.testModel.find({ type }).countDocuments();
        const data = await this.testModel.find({ type }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();

        const returnData = {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            limit
        };

        this.cacheService.set(`test:type:${type}`, returnData); //Lưu vào cache manager

        return returnData;
    }

    async findByIdAndDelete(id: string): Promise<void> {

        const foundTest = await this.testModel.findById(id).exec() as any;
        if(!foundTest){
            throw new HttpException({statusCode: HttpStatus.NOT_FOUND, message: `Test with id ${id} not found`}, HttpStatus.NOT_FOUND);
        }

        const deleteQuestionIds: any[] = [];

        for(const task of foundTest.tasks){
            for(const section of task.sections){
                for(const question of section.questions){
                    deleteQuestionIds.push(question.question._id);
                }
            }
        }

        await this.questionService.bulkDeleteQuestions(deleteQuestionIds); //Xoá trong collection 'question'

        await this.testModel.findByIdAndDelete(id).exec(); //Xóa trong collection 'test'

        await this.cacheService.del(`test:${id}`); //Xóa cache cũ
        await this.cacheService.del(`test:type:${foundTest.type}`); //Xóa cache cũ
        await this.cacheService.del('test:all') //Xoá cache cũ
    }

    async findByIdAndUpdate(id: string, updateTestDTO: UpdateTestDTO): Promise<TestDocument | null> {

        const foundTest = await this.testModel.findById(id).exec();
        if(!foundTest){
            throw new HttpException({statusCode: HttpStatus.NOT_FOUND, message: `Test with id ${id} not found`}, HttpStatus.NOT_FOUND)
        }

        const questionUpdates: {id: string, updateQuestionDTO: UpdateQuestionDTO}[] = [];
        
        for(const task of updateTestDTO.tasks){
            for(const section of task.sections){
                for(const question of section.questions){

                    if(updateTestDTO.type === TestType.WRITING && question.question.type !== QuestionType.ESSAY)
                        throw new HttpException({statusCode: HttpStatus.BAD_REQUEST, message: 'Writing test must have essay question'}, HttpStatus.BAD_REQUEST)

                    if(updateTestDTO.type !== TestType.WRITING && question.question.type === QuestionType.ESSAY)
                        throw new HttpException({statusCode: HttpStatus.BAD_REQUEST, message: `${updateTestDTO.type} test can't have essay question`}, HttpStatus.BAD_REQUEST)

                    questionUpdates.push({
                        id: question.question._id,
                        updateQuestionDTO: question.question
                    })
                }
            }
        }

        try{
            await this.questionService.bulkUpdateQuestions(questionUpdates); 
        }
        catch(err){
            throw new Error(
                `Bulk update questions failed: ${err.message|| err}`
            )
        }

        const updatedTasks: any[] = updateTestDTO.tasks.map((task) => {
            const updatedSections = task.sections.map((section) => {
                const updatedQuestions = section.questions.map((question) => {
                    return {
                        index: question.index,
                        question: this.objectId(question.question._id)   
                    }
                })

                return { ...section, questions: updatedQuestions }
            })

            return { ...task, sections: updatedSections }
        })

        foundTest.set({
            type: updateTestDTO.type,
            tasks: updatedTasks,
        })

        await this.cacheService.del(`test:${id}`); //Xóa cache cũ
        await this.cacheService.del(`test:type:${updateTestDTO.type}`); //Xóa cache cũ
        await this.cacheService.del('test:all') //Xoá cache cũ

        return await foundTest.save();
        
    }

    async findQuestionsByTestId(testId: string, tasks: string){

        const data = await this.testModel.findById(testId).populate({ path: 'tasks.sections.questions.question' }).exec() as any;
        if(!data){
            throw new HttpException({statusCode: HttpStatus.NOT_FOUND, message: `Test with id ${testId} not found`}, HttpStatus.NOT_FOUND);
        }

        const returnDataList: any[] = [];
        const taskSplit: string[] = tasks.split(',');

        data.tasks.forEach((task, index) => {
            if(taskSplit.includes(index.toString()))
                returnDataList.push(task)
        })

        const returnData = {
            testType: data.type,
            tasks: returnDataList
        }

        this.cacheService.set(`test:${testId}:questions?tasks=${tasks}`, returnData)

        return returnData;
    }
}