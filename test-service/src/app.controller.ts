import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Res, StreamableFile, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
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
import express from "express";


@Controller('/api/test')
export class TestController{

    constructor(
        private readonly testService: TestService,
        private readonly configService: ConfigService
    ){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    createTest(@Body() createTestDTO: CreateTestDTO){
        createTestDTO.tasks.map((task, index) => ({
            ...task,
        }))
        return this.testService.createTest(createTestDTO);
    }

    @Post('/audio')
    @UseInterceptors(FilesInterceptor('audio', undefined, {
        storage: diskStorage({
            destination: './uploads/audio',
            filename: (req, file, cb) => {
                const randomName = crypto.createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 12) + 
                Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                return cb(null, `${randomName}${extname(file.originalname)}`)
            }
        })
    }))
    @HttpCode(200)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        }
    })
    uploadAudio(@UploadedFiles() files: Express.Multer.File[]){
        const fileURLs = files.map(file => {
            return `${this.configService.get<string>('BASE_URL')}/uploads/audio/${file.filename}`
        })

        return {
            urls: fileURLs
        }
    }

    @Post('/image')
    @HttpCode(200)
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

    @Post('/excel')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/excel',
            filename: (req, file, cb) => {
                const randomName = crypto.createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 12) + 
                Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                return cb(null, `${randomName}${extname(file.originalname)}`)
            }
        })
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema:{
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    uploadExcel(@UploadedFile() file: Express.Multer.File){
        return this.testService.readExcel(file);
    }

    @Get()
    @HttpCode(200)
    @ApiQuery({name: 'page', type: Number, required: false})
    @ApiQuery({name: 'testName', type: String, required: false, example: "test"})
    @ApiQuery({name: 'type', type: String, required: false, example: TestType.LISTENING})
    @ApiQuery({name: 'fromto', type: String, required: false, example: "01012025-07102025"})
    @ApiQuery({name: 'active', type: Boolean, required: false})
    findAll(@Query('page') page?: number, 
            @Query('testName') testName?: string,
            @Query('type') type?: TestType,
            @Query('fromto') createdAtQuery?: string, // from(ddMMyyyy)-to(ddMMyyyy) Ex: 01012025-07102025
            @Query('active') isActive? : boolean,
        ){
        return this.testService.findAll(page, testName, type, createdAtQuery, isActive);
    }

    @Get(':id')
    @HttpCode(200)
    @ApiParam({name: 'id', type: String})
    findById(@Param('id') id: string){
        return this.testService.findById(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
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
    @HttpCode(200)
    @ApiParam({name: 'testId', type: String})
    @ApiQuery({name: 'tasks', type: String})
    findQuestionsByTest(@Param('testId') testId: string, @Query('tasks') tasks: string){
        return this.testService.findQuestionsByTestId(testId, tasks);
    }

    @Get('/download/template')
    @HttpCode(200)
    downloadTemplateFile(@Res({passthrough: true}) res: express.Response){
        let fileStream: any;
        try{
            fileStream = this.testService.getTestUploadTemplateFileStream();
        }
        catch(error){
            console.log(error);
        }

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="Test Upload Template.xlsx"`
        })

        return new StreamableFile(fileStream);
    }

}