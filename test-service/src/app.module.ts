import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Question, QuestionSchema, QuestionType } from './model/question/question.schema';
import { ChoiceQuestionSchema } from './model/question/choiceQuestion.schema';
import { FillQuestionSchema } from './model/question/fillQuestion.schema';
import { Test, TestSchema, TestType } from './model/test/test.schema';
import { ReadingTestSchema } from './model/test/readingTest.schema';
import { ListeningTestSchema } from './model/test/listeningTest.schema';
import { WritingTestSchema } from './model/test/writingTest.schema';
import { EssayQuestionSchema } from './model/question/essayQuestion.schema';
import { TestService } from './service/test.service';
import { QuestionService } from './service/question.service';
import { ConfigurationService } from './service/config.service';
import { TestController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Giúp ConfigModule có sẵn trên toàn ứng dụng
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    //Feature async cho Question
    MongooseModule.forFeatureAsync([
      {
        name: Question.name,
        useFactory: () => {
          const schema = QuestionSchema;

          //Dùng discriminator để tạo schema trên cùng một Collection
          schema.discriminator(QuestionType.CHOICE, ChoiceQuestionSchema);
          schema.discriminator(QuestionType.FILL, FillQuestionSchema);
          schema.discriminator(QuestionType.ESSAY, EssayQuestionSchema);
          
          return schema;
        }
      }
    ]),
    //Feature async cho Test
    MongooseModule.forFeatureAsync([
      {
        name: Test.name,
        useFactory: () => {
          const schema = TestSchema;

          schema.discriminator(TestType.READING, ReadingTestSchema);
          schema.discriminator(TestType.LISTENING, ListeningTestSchema);
          schema.discriminator(TestType.WRITING, WritingTestSchema);
          
          return schema
        }
      }
    ])
  ],
  //Khai báo các service 
  providers: [TestService, QuestionService, ConfigurationService],
  //Khai báo controller
  controllers: [TestController],
})
export class AppModule {}
