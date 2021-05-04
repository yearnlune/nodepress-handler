import {mongodbHandler} from "./lib/mongodbHandler";
import {Handler} from "./lib/types/handler";

export const nodepressHandler: Handler = {
    mongodbHandler: mongodbHandler
};
