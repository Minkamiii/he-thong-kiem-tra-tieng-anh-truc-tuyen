import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTestDTO, TestTaskDTO, TestTaskSectionDTO, TestTaskSectionQuestionDTO } from 'src/dto/test/create/create-test.dto';
import { UpdateTestDTO } from 'src/dto/test/update/update-test.dto';
import { Test, TestDocument, TestType } from 'src/model/test/test.schema';
import { QuestionService } from './question.service';
import { UpdateQuestionDTO } from 'src/dto/question/update/update-question.dto';
import { CacheService } from './cache.service';
import { QuestionType } from 'src/model/question/question.schema';
import * as xlsx from "xlsx";
import * as fs from "fs";
import { ChoiceItem } from 'src/model/question/choiceQuestion.schema';
import { CreateQuestionDTO } from 'src/dto/question/create/create-question.dto';
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

@Injectable()
export class TestService {

    constructor(
        @InjectModel(Test.name) private testModel: Model<TestDocument>,
        private readonly questionService: QuestionService,
        private readonly cacheService: CacheService,
    ) {}

    private readonly PAGINATION_LIMIT_NUMBER_OF_ITEM = 12; //Tối đa 1 trang có 12 item
    private readonly EXCEL_TASK_MAX_COLUMN = 3;
    private readonly EXCEL_TASK_MAX_ROW = 7;
    private readonly EXCEL_SECTION_MAX_COLUMN = 4;
    private readonly EXCEL_SECTION_MAX_ROW = 27;
    private readonly EXCEL_QUESTION_MAX_COLUMN = 17;
    private readonly EXCEL_QUESTION_MAX_ROW = 52;


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
                        throw new HttpException('Writing test must have essay question', HttpStatus.BAD_REQUEST)

                    if(testData.type !== TestType.WRITING && question.question.type === QuestionType.ESSAY)
                        throw new HttpException(`${testData.type} test can't have essay question`, HttpStatus.BAD_REQUEST)

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

        // await this.cacheService.del(`test:type:${testData.type}`); //Xóa cache cũ
        // await this.cacheService.del('test:all') //Xoá cache cũ

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
        // const cacheData = await this.cacheService.get<{
        //     data: TestDocument[], 
        //     totalItems: number, 
        //     totalPages: number, 
        //     currentPage: number, 
        //     limit: number
        // }>('test:all'); //Lấy data từ cache nếu có

        // if(cacheData) return cacheData; //Nếu có data từ cache trả về luôn

        const skip = (page - 1) * limit;
        const totalItems = await this.testModel.countDocuments();
        const data = await this.testModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-tasks').exec();

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

    async findById(id: string) {
        // const cacheData = await this.cacheService.get<TestDocument>(`test:${id}`); //Lấy data từ cache nếu có

        // if(cacheData){
        //     return cacheData; //Nếu có data từ cache trả về luôn
        // }

        const data = await this.testModel.findById(id).populate({ path: 'tasks.sections.questions.question' }).exec() as any;

        if(!data){
            throw new HttpException(`Test with id ${id} not found`, HttpStatus.NOT_FOUND);
        }

        let testQuestionCount = 0;
        const taskPayload = data.tasks.map(task => {
          let taskQuestionCount = 0;

          for(let section of task.sections){
            taskQuestionCount += section.questions.length;
          }

          testQuestionCount += taskQuestionCount;

          return{
            ...task.toObject?.() ?? task,
            taskQuestionCount: taskQuestionCount,
          }
        })

        const dataPayload = {
          ...data.toObject?.() ?? data,
          tasks: taskPayload,
          testQuestionCount: testQuestionCount
        }
        
        // this.cacheService.set(`test:${id}`, data); //Lưu vào cache service

        return dataPayload;
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
        // const cacheData = await this.cacheService.get<{
        //     data: TestDocument[],
        //     totalItems: number,
        //     totalPages: number,
        //     currentPage: number,
        //     limit: number
        // }>(`test:type:${type}`)

        // if(cacheData) return cacheData; //Nếu có data từ cache trả về luôn

        const skip = (page - 1) * limit;
        const totalItems = await this.testModel.find({ type }).countDocuments();
                const data = await this.testModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-tasks').exec();

        const returnData = {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            limit
        };

        // this.cacheService.set(`test:type:${type}`, returnData); //Lưu vào cache manager

        return returnData;
    }

    async findByIdAndDelete(id: string): Promise<void> {

        const foundTest = await this.testModel.findById(id).exec() as any;
        if(!foundTest){
            throw new HttpException(`Test with id ${id} not found`, HttpStatus.NOT_FOUND);
        }

        const deleteQuestionIds: any[] = [];
        const deleteAudioFile: any[] = [];

        for(const task of foundTest.tasks){
            for(const section of task.sections){
              if(foundTest.type === TestType.LISTENING){
                deleteAudioFile.push(section.audio);
              }
                for(const question of section.questions){
                    deleteQuestionIds.push(question.question._id);
                }
            }
        }
        
        // deleteAudioFile.forEach(path => {
        //   fs.unlink(path, (err) => {
        //     if(err) console.log(err);
        //   });
        // })
        
        await this.questionService.bulkDeleteQuestions(deleteQuestionIds); //Xoá trong collection 'question'

        await this.testModel.findByIdAndDelete(id).exec(); //Xóa trong collection 'test'

        // await this.cacheService.del(`test:${id}`); //Xóa cache cũ
        // await this.cacheService.del(`test:type:${foundTest.type}`); //Xóa cache cũ
        // await this.cacheService.del('test:all') //Xoá cache cũ
    }

    async findByIdAndUpdate(id: string, updateTestDTO: UpdateTestDTO): Promise<TestDocument | null> {

        const foundTest = await this.testModel.findById(id).exec();
        if(!foundTest){
            throw new HttpException(`Test with id ${id} not found`, HttpStatus.NOT_FOUND)
        }

        const questionUpdates: UpdateQuestionDTO[] = [];
        
        for(const task of updateTestDTO.tasks){
            for(const section of task.sections){
                for(const question of section.questions){

                    if(updateTestDTO.type === TestType.WRITING && question.question.type !== QuestionType.ESSAY)
                        throw new HttpException('Writing test must have essay question', HttpStatus.BAD_REQUEST)

                    if(updateTestDTO.type !== TestType.WRITING && question.question.type === QuestionType.ESSAY)
                        throw new HttpException(`${updateTestDTO.type} test can't have essay question`, HttpStatus.BAD_REQUEST)

                    questionUpdates.push(question.question)
                }
            }
        }

        const updatedQuestion = await this.questionService.bulkUpdateQuestions(questionUpdates);
        console.log(updatedQuestion);

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
            testName: updateTestDTO.testName
        })

        // await this.cacheService.del(`test:${id}`); //Xóa cache cũ
        // await this.cacheService.del(`test:type:${updateTestDTO.type}`); //Xóa cache cũ
        // await this.cacheService.del('test:all') //Xoá cache cũ

        return await foundTest.save();
        
    }

    async findQuestionsByTestId(testId: string, tasks: string){

        // const cacheData = await this.cacheService.get<any>(`test:${testId}:questions?tasks=${tasks}`); //Lấy data từ cache nếu có

        // if(cacheData){
        //     return cacheData; //Nếu có data từ cache trả về luôn
        // }

        const data = await this.testModel.findById(testId).populate({ path: 'tasks.sections.questions.question' }).exec() as any;
        if(!data){
            throw new HttpException(`Test with id ${testId} not found`, HttpStatus.NOT_FOUND);
        }

        const returnDataList: any[] = [];
        const taskSplit: string[] = tasks.split(',');

        data.tasks.forEach((task, index) => {
            if(taskSplit.includes(index.toString()))
                returnDataList.push(task)
        })

        const returnData = {
            testName: data.testName,
            testType: data.type,
            tasks: returnDataList
        }

        // this.cacheService.set(`test:${testId}:questions?tasks=${tasks}`, returnData)

        return returnData;
    }

    convertToCreateTestDTO(
        data: xlsx.WorkBook | GoogleSpreadsheet, 
        testName: string,
        testType: string,
        taskSheet: xlsx.WorkSheet | GoogleSpreadsheetWorksheet,
        sectionSheet: xlsx.WorkSheet | GoogleSpreadsheetWorksheet,
        questionSheet: xlsx.WorkSheet | GoogleSpreadsheetWorksheet,
        maxTaskRowCount: number, 
        maxTaskColumnCount: number, 
        maxSectionRowCount: number, 
        maxSectionColumnCount: number, 
        maxQuestionRowCount: number, 
        maxQuestionColumnCount: number,
        taskSheetStartRow: number,
        taskSheetStartColumn: number,
        sectionSheetStartRow: number,
        sectionSheetStartColumn: number,
        questionSheetStartRow: number,
        questionSheetStartColumn: number){
    
          //Tạo return DTO
          const returnData = new CreateTestDTO;
          returnData.testName = testName;
          returnData.tasks = [];
          returnData.type = testType as TestType;
    
           //Dữ liệu cần để xử lý
          const taskSectionIndexes: {
            taskIndex: number,
            sectionIndex: number
          }[] = [];
    
          let haveTask: boolean = true;
          for(let row = taskSheetStartRow; row < maxTaskRowCount; row++){
            if(!haveTask) break;
            for(let col = taskSheetStartColumn; col < maxTaskColumnCount; col++){
              const cellValue = data instanceof GoogleSpreadsheet ? 
                                taskSheet.getCell(row, col).value : 
                                taskSheet[xlsx.utils.encode_cell({r: row, c: col})]?.v;
              if(col===0 && !cellValue){
                haveTask = false;
                break;
              }
    
              switch(col){
                case 1:
                  const taskData = new TestTaskDTO;
                  taskData.sections = [];
                  switch(testType){
                    case TestType.LISTENING:
                      taskData.audio = "test";
                      break;
                    case TestType.READING:
                      taskData.passage = cellValue as string;
                      break;
                  }
    
                  if(!taskData.audio) delete taskData.audio;
                  if(!taskData.passage) delete taskData.passage;
    
                  returnData.tasks.push(taskData)
    
                  break;
                case 2:
                  break;
              }
            }
          }
    
          let hasSection: boolean = true;
          for(let row = sectionSheetStartRow; row < maxSectionRowCount; row++){
            if(!hasSection) break;
            let taskPosition: number = -1;
            for(let col = sectionSheetStartColumn; col < maxSectionColumnCount; col++){
              const cellValue = data instanceof GoogleSpreadsheet ? 
                                sectionSheet.getCell(row, col).value : 
                                sectionSheet[xlsx.utils.encode_cell({r: row, c: col})]?.v;
              if(col===0 && !cellValue){
                hasSection = false;
                break;
              }
              if(!cellValue) continue;
    
              switch(col){
                case 1:
                  taskPosition = cellValue as any;
                  break;
                case 2:
                  const sectionData = new TestTaskSectionDTO;
                  sectionData.title = cellValue as any;
                  sectionData.questions = [];
                  returnData.tasks[taskPosition-1].sections.push(sectionData);
    
                  taskSectionIndexes.push({
                    taskIndex: taskPosition,
                    sectionIndex: returnData.tasks[taskPosition-1].sections.length
                  })
    
                  break;
              }
            }
          }
    
          let hasQuestion: boolean = true;
          for(let row = questionSheetStartRow; row < maxQuestionRowCount; row++){
            if(!hasQuestion) break;
            let sectionPosition: number = -1;
            let taskPosition: number = -1;
            const question = new CreateQuestionDTO;
            let questionType: any;
            let numberOfChoices: number = 0;
            for(let col = questionSheetStartColumn; col < maxQuestionColumnCount; col++){
              const cellValue = data instanceof GoogleSpreadsheet ? 
                                questionSheet.getCell(row, col).formattedValue : 
                                questionSheet[xlsx.utils.encode_cell({r: row, c: col})]?.w;
              if(col===0 && !cellValue){
                hasQuestion = false;
                break;
              }
    
              switch(col){
                // case 0:
                //   if(!cellValue)
                //     throw new HttpException(`Question ${row-1} field "STT" is must have`, HttpStatus.BAD_REQUEST);
                //   stt = cellValue as number;
                case 1:
                  if(!cellValue)
                    throw new HttpException(`Question ${row} field "STT Section" is must have`, HttpStatus.BAD_REQUEST);
                  sectionPosition = taskSectionIndexes[cellValue as number-1].sectionIndex-1;
                  taskPosition = taskSectionIndexes[cellValue as number-1].taskIndex-1;
                  break;
                case 2:
                  if(!cellValue)
                    throw new HttpException(`Question ${row} field "Question type" is must have`, HttpStatus.BAD_REQUEST);
                  questionType = cellValue;
                  question.type = questionType;
                  switch(questionType){
                    case QuestionType.FILL:
                      break;
                    case QuestionType.CHOICE:
                      question.choices = [];
                      break;
                    case QuestionType.ESSAY:
                      break;
                  }
                  break;
                case 3:
                  question.question = !cellValue ? "" : cellValue.toString();
                  break;
                case 4: //TO-DO
                  break;
                case maxQuestionColumnCount-1:
                  const choiceTypeQuestionRegex = /^(?:[0-9]|10)(?:,(?:[0-9]|10)){0,10}$/;
                  switch(questionType){
                    case QuestionType.FILL:
                      if(!cellValue)
                        throw new HttpException(`Fill question ${row} must have key`, HttpStatus.BAD_REQUEST);
                      const key = cellValue as string;
                      if(choiceTypeQuestionRegex.test(key))
                        throw new HttpException(``, HttpStatus.BAD_REQUEST);
                      question.key = key;
                      break;
                    case QuestionType.CHOICE:
                      if(!cellValue) 
                        throw new HttpException(`Choice question ${row} must have keys`, HttpStatus.BAD_REQUEST);
                      const value = cellValue;
                      if(!choiceTypeQuestionRegex.test(value))
                        throw new HttpException(
                          `Choice question ${row} must have at most 11 keys, separated by comma, each keys must in range 0 to 10`, 
                          HttpStatus.BAD_REQUEST);
                      const choiceKeys = value.toString().split(',');
                      const keys: number[] = [];
                      choiceKeys.map(key => keys.push(parseInt(key)-1));
                      question.keys = keys;
                      break;
                    case QuestionType.ESSAY:
                      if(cellValue)
                        throw new HttpException(`Essay question ${row} must not have key`, HttpStatus.BAD_REQUEST);
                      break;
                  }
    
                  if(!question.question) question.question = "";
                  if(!question.choices) delete question.choices;
                  if(!question.keys) delete question.keys;
                  if(!question.key) delete question.key;
    
                  const taskSectionQuestion = new TestTaskSectionQuestionDTO;
                  taskSectionQuestion.index = 0;
                  taskSectionQuestion.question = question;
                  returnData.tasks[taskPosition]
                            .sections[sectionPosition]
                            .questions.push(taskSectionQuestion);
    
                  break;
                default:
                  if(questionType===QuestionType.CHOICE){
                    if(!cellValue) continue;
                    const choiceItem = new ChoiceItem;
                    choiceItem.text = cellValue.toString();
                    choiceItem.initialChoiceIndex = numberOfChoices;
                    numberOfChoices++;
                    question.choices?.push(choiceItem);
                    break;
                  }
              }
            }
          }
    
          //Gắn index vào từng câu hỏi
          let questionNumberCount = 0;
          returnData.tasks.forEach((task, index) => {
            task.sections.forEach((section, index) => {
              section.questions.forEach((question, index) => {
                question.index = questionNumberCount;
                questionNumberCount++;
              })
            })
          })
    
          return returnData;
    }
    
    readExcel(file: Express.Multer.File){
        //Đọc file
        const fileData = xlsx.readFile(file.path);
  
        //Lấy tên sheet
        const informationSheet = fileData.SheetNames[0];
        const taskSheet = fileData.SheetNames[1];
        const sectionSheet = fileData.SheetNames[2];
        const questionSheet = fileData.SheetNames[3];

        const informationSheetData = fileData.Sheets[informationSheet];
        const informationSheetRange = xlsx.utils.decode_range(informationSheetData['!ref'] as string);
        let testName: string = "";
        let testType: string = "";
        for(let row = informationSheetRange.s.r+1; row <= informationSheetRange.e.r; row++){
          for(let col = informationSheetRange.s.c; col <= informationSheetRange.e.c; col++){
            const cellValue = informationSheetData[xlsx.utils.encode_cell({r: row, c: col})]?.w;
            switch(col){
              case 0:
                testName = cellValue as string;
                break;
              case 1:
                testType = cellValue as TestType;
                break;
            }
          }
        }

        //Xử lý ở sheet task
        const taskSheetData = fileData.Sheets[taskSheet];
        const taskSheetRange = xlsx.utils.decode_range(taskSheetData['!ref'] as string);
  
        const sectionSheetData = fileData.Sheets[sectionSheet];
        const sectionSheetRange = xlsx.utils.decode_range(sectionSheetData['!ref'] as string);
  
        const questionSheetData = fileData.Sheets[questionSheet];
        const questionSheetRange = xlsx.utils.decode_range(questionSheetData['!ref'] as string);
  
        const returnData = this.convertToCreateTestDTO(
          fileData,
          testName,
          testType,
          taskSheetData,
          sectionSheetData,
          questionSheetData,
          this.EXCEL_TASK_MAX_ROW,
          this.EXCEL_TASK_MAX_COLUMN,
          this.EXCEL_SECTION_MAX_ROW,
          this.EXCEL_SECTION_MAX_COLUMN,
          this.EXCEL_QUESTION_MAX_ROW,
          this.EXCEL_QUESTION_MAX_COLUMN,
          taskSheetRange.s.r+1,
          taskSheetRange.s.c,
          sectionSheetRange.s.r+1,
          sectionSheetRange.s.c,
          questionSheetRange.s.r+1,
          questionSheetRange.s.c
        );
  
        //Xoá file vừa thêm vào
        fs.unlink(file.path, (err) => {
          if(err) console.log(err);
        });
  
        return returnData;
    }
}