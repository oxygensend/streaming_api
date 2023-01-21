export namespace config {
    export const rootDirectory = process.env.PWD;
    export const storageDirectory = process.env.PWD + "/storage";
    export const testDirectory = process.env.PWD + '/tests';
    export const db_url = process.env["MONGODB_URI"];
    export const port = process.env.PORT;
}