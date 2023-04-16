import {config as configDotEnv} from "dotenv" ;

configDotEnv({path: '.env.local'})

export namespace config {

    export const rootDirectory = process.env.PWD;
    export const controllersDirectory = process.env.PWD + '/src/controllers';
    export const storageDirectory = process.env.PWD + "/storage";
    export const testDirectory = process.env.PWD + '/tests';
    export const templatesDirectory = process.env.PWD + '/templates';
    export const db_url = process.env["MONGODB_URI"];
    export const port = process.env.PORT;
    export const aws_region = process.env.AWS_REGION as string;
    export const aws_bucket = process.env.AWS_BUCKET as string;
    export const aws_access_key_id = process.env.AWS_ACCESS_KEY_ID as string;
    export const aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY as string;
}