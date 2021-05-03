import {Db, MongoClient} from "mongodb";
import {MongoConfig} from "./types/handler";

export class MongodbHandler {
    private _config!: MongoConfig
    private _connection!: MongoClient;

    constructor() {
        this._config = {
            host: process.env.MONGO_DB_HOST || 'localhost',
            port: parseInt(process.env.MONGO_DB_PORT || '27017'),
            defaultDbName: process.env.MONGO_DB_NAME || 'default',
            url: process.env.MONGO_DB_URL || 'mongodb://localhost:27017'
        };
    }

    tryConnect(config?: MongoConfig): Promise<void> {
        return this.connect(config);
    }

    private connect(config?: MongoConfig): Promise<void> {
        if (config) {
            this._config = config;
        }

        return new Promise<void>((resolve, reject) => {
            MongoClient.connect(this.getMongoUrl(), {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                poolSize: 5
            }, (err, client) => {
                if (err) {
                    console.error(err);
                    reject();
                } else {
                    this._connection = client;
                    resolve();
                }
            });
        })
    }

    private getMongoUrl(): string {
        return this._config.url || 'mongodb://' + this._config.host + ':' + this._config.port;
    }

    getSafeConnection(handler: (db: Db) => any, dbName?: string): Promise<void> {
        const mongoConfig = this._config;
        if (!dbName) {
            dbName = mongoConfig.defaultDbName;
        }

        return new Promise<void>((resolve, reject) => {
            if (this._connection?.isConnected()) {
                const db = this._connection.db(dbName);
                Promise.resolve(handler(db))
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                if (!this._connection) {
                    reject(new Error('Not connected'));
                }
                this._connection?.connect()
                    .then((mongoClient) => {
                        const db = mongoClient.db(dbName);
                        Promise.resolve(handler(db))
                            .then((result) => {
                                resolve(result);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    })
                    .catch(reject);
            }
        });
    }

    healthCheck(): Promise<any> {
        let status = false;
        return this.getSafeConnection(async (db) => {
            await db.command({ping: 1});
            status = true;
        })
            .then(() => status ? Promise.resolve() : Promise.reject(new Error('ping failed')));
    }
}

export const mongodbHandler: MongodbHandler = new MongodbHandler();
