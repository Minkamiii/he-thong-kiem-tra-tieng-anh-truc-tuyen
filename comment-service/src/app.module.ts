import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./model/comment.schema";
import { CommentService } from "./service/comment.service";
import { CommentController } from "./app.controller";

@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService]
    }),

    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      }
    ])

  ],

  providers: [CommentService],

  exports: [],

  controllers: [CommentController],
  
})
export class AppModule{}