import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { CreateTestDTO } from "./dto/test/create/create-test.dto";
import { TestService } from "./service/test.service";
import { TestType } from "./model/test/test.schema";
import { diskStorage } from "multer";
import { UpdateTestDTO } from "./dto/test/update/update-test.dto";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { extname } from "path";
import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { ApiBody, ApiConsumes, ApiParam, ApiQuery } from "@nestjs/swagger";
import { GetAllQuestionByTestIDDTO } from "./dto/question/get/get-all-question.dto";


@Controller('/api/test')
export class TestController{

    constructor(
        private readonly testService: TestService,
        private readonly configService: ConfigService
    ){}

    @Post()
    @HttpCode(201)
    @UseInterceptors(FilesInterceptor('audio', undefined, {
        storage: diskStorage({
            destination: './uploads/listening',
            filename: (req, file, cb) => {
                const randomName = crypto.createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 12) + 
                Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                return cb(null, `${randomName}${extname(file.originalname)}`)
            }

        })
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: Object.values(TestType),
                    description: 'Loại bài test',
                },
                tasks: {
                    type: 'array',
                    description: 'Danh sách tasks trong bài test',
                    items: {
                        type: 'object',
                        properties: {
                            passage: { type: 'string', description: 'Đoạn văn (nếu có)' },
                            audio: { type: 'string', format: 'binary', description: 'File audio cho task (nếu là Listening)' },
                            sections: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string', description: 'Tiêu đề section' },
                                        questions: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    index: { type: 'number', description: 'Vị trí câu hỏi trong đề' },
                                                    question: { type: 'string', description: 'ObjectId của câu hỏi' }
                                                },
                                                required: ['index', 'question']
                                            }
                                        }
                                    },
                                    required: ['title', 'questions']
                                }
                            }
                        },
                        required: ['sections'] // nếu passage hoặc audio không bắt buộc thì bỏ khỏi đây
                    }
                },
                audio: {
                    type: 'array',
                    items: {
                    type: 'string',
                    format: 'binary'
                    },
                    description: 'Danh sách file audio, index khớp với tasks'
                }
            },
            required: ['type', 'tasks'] // chỉ thêm field bắt buộc ở đây
        }
    })
    createTest(@Body() createTestDTO: CreateTestDTO, @UploadedFiles() files: Express.Multer.File[]){
        createTestDTO.tasks.map((task, index) => ({
            ...task,
            ...(createTestDTO.type === TestType.LISTENING && {audio: files[index].filename}) //Chỉ thêm file khi type của test là Listening
        }))
        return this.testService.createTest(createTestDTO);
    }

    @Post('/image')
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/images',
            filename: (req, file, cb) => {
                const randomName = crypto.createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 12) + 
                Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema:{
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    uploadImage(@UploadedFile() file: Express.Multer.File){
        const fileURL = `${this.configService.get<string>('BASE_URL')}/uploads/images/${file.filename}`;
        return { url: fileURL};
    }

    @Get()
    @HttpCode(200)
    @ApiQuery({name: 'page', type: Number, required: false})
    findAll(@Query('page') page: number){
        return this.testService.findAll(page);
    }

    @Get(':id')
    @HttpCode(200)
    @ApiParam({name: 'id', type: String})
    findById(@Param('id') id: string){
        return this.testService.findById(id);
    }

    @Get('/type/:type')
    @HttpCode(200)
    @ApiParam({name: 'type', type: String})
    @ApiQuery({name: 'page', type: Number, required: false})
    findByType(@Param('type') type: TestType, @Query('page') page: number){
        return this.testService.findByType(type, page);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiParam({name: 'id', type: String})
    async findByIdAndDelete(@Param('id') id: string){
        await this.testService.findByIdAndDelete(id);
    }

    @Put(':id')
    @HttpCode(200)
    @ApiBody({type: UpdateTestDTO})
    @ApiParam({name: 'id', type: String})
    findByIdAndUpdate(@Param('id') id: string, @Body() updateTestDTO: UpdateTestDTO){
        return this.testService.findByIdAndUpdate(id, updateTestDTO);
    }

    @Get(':testId/questions')
    findQuestionsByTest(@Param('testId') testId: string, @Query('tasks') tasks: string){
        return this.testService.findQuestionsByTestId(testId, tasks);
    }

}