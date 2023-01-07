import {Schema, model} from "mongoose";

export interface IVideo {
    title: string,
    filename: string,
}

const videoSchema = new Schema<IVideo>({
    title: {
        type: String,
        minlength: 3,
        maxlength: 50,
        trim: true,
        required: true
    },
    filename: {
        type: String,
        required: true
    }

});


export const Video = model<IVideo>('Video', videoSchema);