import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class ConfigurationService{
    constructor(private configService: ConfigService){}

    private readonly MAX_AUDIO_FILES_UPLOAD_PER_REQUEST = 5;

    getMongoURI(){
        return this.configService.get<string>('MONGO_URI');
    }

    getMaxAudioFilesUploadPerRequest(){
        return this.MAX_AUDIO_FILES_UPLOAD_PER_REQUEST;
    }
}