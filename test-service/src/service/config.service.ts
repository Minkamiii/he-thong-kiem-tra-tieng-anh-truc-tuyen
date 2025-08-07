import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class ConfigurationService{
    constructor(private configService: ConfigService){}

    getMongoURI(){
        return this.configService.get<string>('MONGO_URI');
    }
}