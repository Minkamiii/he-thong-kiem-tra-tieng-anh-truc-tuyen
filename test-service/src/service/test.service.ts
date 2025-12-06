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
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import axios, { Axios } from 'axios';
import { ConfigService } from '@nestjs/config';

dayjs.extend(timezone);
dayjs.extend(utc);

enum TestUploadSheets{
  TESTINFORMATION = "test information",
  TASK = "task",
  SECTION = "section",
  QUESTION = "question"
}

@Injectable()
export class TestService {

    constructor(
        @InjectModel(Test.name) private testModel: Model<TestDocument>,
        private readonly questionService: QuestionService,
        private readonly configService: ConfigService,
    ) {}

    private readonly PAGINATION_LIMIT_NUMBER_OF_ITEM = 12; //Tối đa 1 trang có 12 item
    private readonly EXCEL_TASK_MAX_COLUMN = 2;
    private readonly EXCEL_TASK_MAX_ROW = 7;
    private readonly EXCEL_SECTION_MAX_COLUMN = 3;
    private readonly EXCEL_SECTION_MAX_ROW = 27;
    private readonly EXCEL_QUESTION_MAX_COLUMN = 17;
    private readonly EXCEL_QUESTION_MAX_ROW = 52;


    objectId(id: string){
        return new Types.ObjectId(id);
    }

    async createTest(createTestDTO: CreateTestDTO): Promise<TestDocument> {
        const testData = JSON.parse(JSON.stringify(createTestDTO));
        testData.active = true; //Thêm trường active cho test mới

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
        let numberOfQuestion: number = 0;
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
        testName?: string,
        type? : TestType,
        createdAtQuery? : string,
        isActive?: boolean
    ): Promise<{
        data: TestDocument[], 
        totalItems: number, 
        totalPages: number, 
        currentPage: number, 
        limit: number
    }> {

        const filter: any = {};

        const parseDate = (dateString: string, first: boolean = true) => {
          const day = parseInt(dateString.slice(0, 2), 10);
          const month = parseInt(dateString.slice(2, 4), 10) -1;
          const year = parseInt(dateString.slice(4, 8), 10);
          return new Date(year, month, day, first ? 0 : 23, first ? 0 : 59, first ? 0 : 59);
        }

        if(testName) filter.testName = { $regex: testName, $options: 'i' }
        if(type) filter.type = type
        if(createdAtQuery) filter.createdAt = {
          $gte: parseDate(createdAtQuery.split('-')[0]),
          $lte: parseDate(createdAtQuery.split('-')[1], false)
        }
        if(isActive) filter.active = isActive;

        const skip = (page - 1) * this.PAGINATION_LIMIT_NUMBER_OF_ITEM;
        const totalItems = await this.testModel.find(filter).countDocuments();
        const data = await this.testModel.find(filter)
                                        .sort({ createdAt: -1 })
                                        .skip(skip)
                                        .limit(this.PAGINATION_LIMIT_NUMBER_OF_ITEM)
                                        .lean();

        const converted = data.map((item: any) => {

          let questionCount: number = 0;
          let taskCount: number = item.tasks.length;
          item.tasks.forEach((task, index) => {
            task.sections.forEach((section, index) => {
              questionCount += section.questions.length;
            })
          })

          delete item.tasks;

          return {
            ...item,
            createdAt: dayjs(item.createdAt).tz('Asia/Ho_Chi_Minh').format(),
            updatedAt: dayjs(item.updatedAt).tz('Asia/Ho_Chi_Minh').format(),
            questionCount: questionCount,
            taskCount: taskCount
          }
        }) as TestDocument[];

        const returnData = {
            data: converted,
            totalItems,
            totalPages: Math.ceil(totalItems / this.PAGINATION_LIMIT_NUMBER_OF_ITEM),
            currentPage: page,
            limit: this.PAGINATION_LIMIT_NUMBER_OF_ITEM
        };

        return returnData;
    }

    async findById(id: string) {

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
          questionCount: testQuestionCount,
          createdAt: dayjs(data.createdAt).tz('Asia/Ho_Chi_Minh').format(),
          updatedAt: dayjs(data.updatedAt).tz('Asia/Ho_Chi_Minh').format()
        }

        return dataPayload;
    }

    async findByIdAndDelete(id: string): Promise<void> {

        const foundTest = await this.testModel.findById(id).exec() as any;
        if(!foundTest){
            throw new HttpException(`Test with id ${id} not found`, HttpStatus.NOT_FOUND);
        }

        const deleteQuestionIds: any[] = [];
        const deleteAudioFile: any[] = [];
        const deleteImageFile: any[] = [];

        for(const task of foundTest.tasks){
          if(task.image) deleteImageFile.push(`.${new URL(task.image).pathname}`)
          if (foundTest.type === TestType.LISTENING) {
            deleteAudioFile.push(`.${new URL(task.audio).pathname}`);
          }
            for(const section of task.sections){
              if(section.image) deleteImageFile.push(`.${new URL(task.image).pathname}`)
              for (const question of section.questions) {
                deleteQuestionIds.push(question.question._id);
                if(question.image) deleteImageFile.push(`.${new URL(task.image).pathname}`)
              }
            }
        }

        console.log(deleteImageFile);

        if(foundTest.type === TestType.LISTENING){
          deleteAudioFile.forEach(path => {
            if(fs.existsSync(path)){
              fs.unlinkSync(path);
            }
          }) 
        }
        if(deleteImageFile.length > 0){
          deleteImageFile.forEach(path => {
            if(fs.existsSync(path)){
              fs.unlinkSync(path);
            }
          })
        }
        
        axios.delete(`${this.configService.get<string>('BASE_COMMENT_SERVICE_LINK')}/test/${id}`)
        .then()
        .catch(err => {
          throw new HttpException(err.response.data, err.response.status);
        })
        
        await this.questionService.bulkDeleteQuestions(deleteQuestionIds); //Xoá trong collection 'question'

        await this.testModel.findByIdAndDelete(id).exec(); //Xóa trong collection 'test'

        // await this.cacheService.del(`test:${id}`); //Xóa cache cũ
        // await this.cacheService.del(`test:type:${foundTest.type}`); //Xóa cache cũ
        // await this.cacheService.del('test:all') //Xoá cache cũ
    }

    async findByIdAndUpdate(id: string, updateTestDTO: UpdateTestDTO): Promise<TestDocument | null> {

      const foundTest = await this.testModel.findById(id).exec();
      if (!foundTest) {
        throw new HttpException(`Test with id ${id} not found`, HttpStatus.NOT_FOUND)
      }

      const questionUpdates: UpdateQuestionDTO[] = [];

      for (const task of updateTestDTO.tasks) {
        if(updateTestDTO.type === TestType.READING && task.passage?.length === 0){
          throw new HttpException(`Reading test must have passage`, HttpStatus.BAD_REQUEST);
        }
        for (const section of task.sections) {
          for (const question of section.questions) {

            if (updateTestDTO.type === TestType.WRITING && question.question.type !== QuestionType.ESSAY)
              throw new HttpException('Writing test must have essay question', HttpStatus.BAD_REQUEST)

            if (updateTestDTO.type !== TestType.WRITING && question.question.type === QuestionType.ESSAY)
              throw new HttpException(`${updateTestDTO.type} test can't have essay question`, HttpStatus.BAD_REQUEST)

            switch(question.question.type){
              case QuestionType.CHOICE:
                question.question.choices?.map((item, index) => {
                  if(item.text.length === 0){
                    throw new HttpException(`Choice keys must not empty`, HttpStatus.BAD_REQUEST);
                  }
                })
                break;
              case QuestionType.FILL:
                if(question.question.key?.length === 0){
                  throw new HttpException(`Fill key must not empty`, HttpStatus.BAD_REQUEST);
                }
                break;
            }

            questionUpdates.push(question.question)
          }
        }
      }

      const updatedQuestion = await this.questionService.bulkUpdateQuestions(questionUpdates);

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
        testName: updateTestDTO.testName,
        active: updateTestDTO.active
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
            type: data.type,
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
          for(let row = taskSheetStartRow + 1; row < maxTaskRowCount; row++){
            if(!haveTask) break;
            const taskData = new TestTaskDTO;
            taskData.sections = [];
            for(let col = taskSheetStartColumn; col < maxTaskColumnCount; col++){
              const cellValue = data instanceof GoogleSpreadsheet ? 
                                taskSheet.getCell(row, col).value : 
                                taskSheet[xlsx.utils.encode_cell({r: row, c: col})]?.v;
              if(col===0 && !cellValue){
                haveTask = false;
                break;
              }
    
              switch(col){
                case 0:
                  switch(testType){
                    case TestType.LISTENING:
                      taskData.audio = "";
                      break;
                    case TestType.READING:
                      taskData.passage = cellValue as string;
                      break;
                  }
    
                  if(!taskData.audio) delete taskData.audio;
                  if(!taskData.passage) delete taskData.passage;
    
                  break;
                case 1:
                  if(cellValue){
                    if(testType === TestType.WRITING)
                      throw new HttpException(`Task ${row} field "Image link" should not have image on Writing test`, HttpStatus.BAD_REQUEST);
                    taskData.image = cellValue as string;
                  }

                  if(!taskData.image) delete taskData.image;
                  
                  returnData.tasks.push(taskData);
                  break;
              }
            }
          }
    
          let hasSection: boolean = true;
          let totalSectionCount: number = 0;
          for(let row = sectionSheetStartRow + 1; row < maxSectionRowCount; row++){
            if(!hasSection) break;
            let taskPosition: number = -1;
            const sectionData = new TestTaskSectionDTO;
            sectionData.questions = [];
            for(let col = sectionSheetStartColumn; col < maxSectionColumnCount; col++){
              const cellValue = data instanceof GoogleSpreadsheet ? 
                                sectionSheet.getCell(row, col).value : 
                                sectionSheet[xlsx.utils.encode_cell({r: row, c: col})]?.v;
              if(col===0 && !cellValue){
                hasSection = false;
                break;
              }
    
              switch(col){
                case 0:
                  if(!cellValue || !Number.isInteger(Number(cellValue)) || cellValue < 0 || cellValue > returnData.tasks.length)
                    throw new HttpException(`Invalid "Task No" field at Section row ${row}`, HttpStatus.BAD_REQUEST);
                  taskPosition = cellValue as any;
                  break;
                case 1:
                  if(testType !== TestType.WRITING && !cellValue)
                    throw new HttpException(`Section ${row-1} field "Title" is must have`, HttpStatus.BAD_REQUEST);
                  if(testType !== TestType.WRITING)
                    sectionData.title = cellValue as any;

                  break;
                case 2:
                  if(cellValue){
                    if(testType === TestType.WRITING)
                      throw new HttpException(`Section ${row-1} field "Image link" should not have image on Writing test`, HttpStatus.BAD_REQUEST);
                    sectionData.image = cellValue as string;
                  }

                  if(!sectionData.image) delete sectionData.image;

                  returnData.tasks[taskPosition - 1].sections.push(sectionData);

                  taskSectionIndexes.push({
                    taskIndex: taskPosition,
                    sectionIndex: returnData.tasks[taskPosition - 1].sections.length
                  })
                  totalSectionCount++;
                  break;
              }
            }
          }
    
          let hasQuestion: boolean = true;
          for(let row = questionSheetStartRow + 1; row < maxQuestionRowCount; row++){
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
                case 1:
                  if(!cellValue || !Number.isInteger(Number(cellValue)) || cellValue < 1 || cellValue > totalSectionCount)
                    throw new HttpException(`Invalid "Section No" in sheet Question at row ${row}`, HttpStatus.BAD_REQUEST);
                  sectionPosition = taskSectionIndexes[cellValue as number-1].sectionIndex-1;
                  taskPosition = taskSectionIndexes[cellValue as number-1].taskIndex-1;
                  break;
                case 2:
                  if(!cellValue)
                    throw new HttpException(`Question ${row} field "Question type" is must have`, HttpStatus.BAD_REQUEST);
                  if(![QuestionType.CHOICE, QuestionType.ESSAY, QuestionType.FILL].includes(cellValue))
                    throw new HttpException(`Invalid question type at row ${row}`, HttpStatus.BAD_REQUEST)
                  questionType = cellValue;
                  question.type = questionType;
                  if(testType !== TestType.WRITING && questionType === QuestionType.ESSAY)
                    throw new HttpException(`Reading and Listening test can not have Essay question`, HttpStatus.BAD_REQUEST);
                  if(testType === TestType.WRITING && questionType !== QuestionType.ESSAY)
                    throw new HttpException(`Writing test can only have Essay question`, HttpStatus.BAD_REQUEST);
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
                case 4:
                  if(cellValue) question.image = cellValue as string;
                  break;
                case maxQuestionColumnCount-1:
                  const choiceTypeQuestionRegex = /^(?:[0-9]|10)(?:,(?:[0-9]|10)){0,10}$/;
                  switch(questionType){
                    case QuestionType.FILL:
                      if(!cellValue)
                        throw new HttpException(`Fill question ${row} must have key`, HttpStatus.BAD_REQUEST);
                      const key = cellValue as string;
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
                      choiceKeys.map(key => {
                        if(!Number.isInteger(Number(cellValue)) || parseInt(key) > numberOfChoices || parseInt(key) < 1){
                          throw new HttpException(
                            `Invalid key number for choice question. The key number can not exceed number of choices`, 
                            HttpStatus.BAD_REQUEST
                          );
                        }
                        keys.push(parseInt(key)-1)
                      });
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
    
    async readExcel(file: Express.Multer.File){
        //Đọc file
        const fileData = xlsx.readFile(file.path);
  
        //Lấy tên sheet
        const informationSheet = fileData.SheetNames[0];
        const taskSheet = fileData.SheetNames[1];
        const sectionSheet = fileData.SheetNames[2];
        const questionSheet = fileData.SheetNames[3];

        if(informationSheet.toLowerCase() !== TestUploadSheets.TESTINFORMATION) 
          throw new HttpException("First sheet must be Test Information", HttpStatus.BAD_REQUEST);
        const informationSheetData = fileData.Sheets[informationSheet];
        const informationSheetRange = xlsx.utils.decode_range(informationSheetData['!ref'] as string);
        let testName: string = "";
        let testType: string = "";
        for(let row = informationSheetRange.s.r+2; row <= informationSheetRange.e.r; row++){
          for(let col = informationSheetRange.s.c; col <= informationSheetRange.e.c; col++){
            const cellValue = informationSheetData[xlsx.utils.encode_cell({r: row, c: col})]?.w;
            switch(col){
              case 0:
                if(!cellValue){
                  this.deleteExcel(file);
                  throw new HttpException("Test name must not empty", HttpStatus.BAD_REQUEST);
                }
                testName = cellValue as string;
                break;
              case 1:
                if(!cellValue){
                  this.deleteExcel(file);
                  throw new HttpException("Invalid test type", HttpStatus.BAD_REQUEST);
                }
                testType = cellValue.toString().trim().toLowerCase();
                if(![TestType.LISTENING, TestType.READING, TestType.WRITING].includes(testType as TestType)){
                  this.deleteExcel(file);
                  throw new HttpException("Wrong test type", HttpStatus.BAD_REQUEST);
                }
                break;
            }
          }
        }

        //Xử lý ở sheet task
        if(taskSheet.toLowerCase() !== TestUploadSheets.TASK){
          this.deleteExcel(file);
          throw new HttpException("Second sheet must be Task", HttpStatus.BAD_REQUEST);
        }
        const taskSheetData = fileData.Sheets[taskSheet];
        const taskSheetRange = xlsx.utils.decode_range(taskSheetData['!ref'] as string);
  
        if(sectionSheet.toLowerCase() !== TestUploadSheets.SECTION) {
          this.deleteExcel(file);
          throw new HttpException("Third sheet must be Section", HttpStatus.BAD_REQUEST);
        }
        const sectionSheetData = fileData.Sheets[sectionSheet];
        const sectionSheetRange = xlsx.utils.decode_range(sectionSheetData['!ref'] as string);
  
        if(questionSheet.toLowerCase() !== TestUploadSheets.QUESTION) {
          this.deleteExcel(file);
          throw new HttpException("Fourth sheet must be Question", HttpStatus.BAD_REQUEST);
        }
        const questionSheetData = fileData.Sheets[questionSheet];
        const questionSheetRange = xlsx.utils.decode_range(questionSheetData['!ref'] as string);
  
        try{
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
          
          this.deleteExcel(file);
    
          return returnData;
        }
        finally{
          this.deleteExcel(file);
        }
    }

    getTestUploadTemplateFileStream(){
      const filePath = './uploads/excel/Test Upload Template.xlsx'

      if(!fs.existsSync(filePath)){
        console.error("Cannot find file with path " + filePath)
      }

      return fs.createReadStream(filePath);
    }

    deleteExcel(file: Express.Multer.File){
        //Xoá file vừa thêm vào
        if(fs.existsSync(file.path)){
          fs.unlinkSync(file.path);
        }
        else{
          console.error("Cannot find file with path " + file.path)
        }
    }

    deleteImage(url: string){
      const path = `.${new URL(url).pathname}`;
      if(fs.existsSync(path)){
        fs.unlinkSync(path);
      }
      else{
        throw new HttpException('File do not exists', HttpStatus.NOT_FOUND);
      }
    }

}