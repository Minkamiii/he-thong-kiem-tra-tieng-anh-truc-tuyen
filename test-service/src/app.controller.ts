import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from "@nestjs/common";
import { CreateTestDTO } from "./dto/test/create/create-test.dto";
import { TestService } from "./service/test.service";
import { TestType } from "./model/test/test.schema";
import { UpdateTestDTO } from "./dto/test/update/update-test.dto";


@Controller('/api/test')
export class TestController{

    constructor(private readonly testService: TestService){}

    @Post()
    @HttpCode(201)
    createTest(@Body() createTestDTO: CreateTestDTO){
        return this.testService.createTest(createTestDTO);
    }

    @Get()
    @HttpCode(200)
    findAll(){
        return this.testService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    findById(@Param('id') id: string){
        return this.testService.findById(id);
    }

    @Get('/type/:type')
    @HttpCode(200)
    findByType(@Param('type') type: TestType){
        return this.testService.findByType(type);
    }

    @Delete(':id')
    @HttpCode(204)
    async findByIdAndDelete(@Param('id') id: string){
        await this.testService.findByIdAndDelete(id);
    }

    @Put(':id')
    @HttpCode(200)
    findByIdAndUpdate(@Param('id') id: string, @Body() updateTestDTO: UpdateTestDTO){
        return this.testService.findByIdAndUpdate(id, updateTestDTO);
    }

}