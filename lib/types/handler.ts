import {MongodbHandler} from "../mongodbHandler";

export interface Handler {
    mongodbHandler: MongodbHandler
}

export interface MongoConfig {
    host: string;
    port: number;
    defaultDbName: string;
    url: string;
}
