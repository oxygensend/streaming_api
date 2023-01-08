import {Schema, model} from "mongoose";

export interface IVideo {
    _id?: string,
    title: string,
    originalName: string,
    bytes: number,
    path: string,
    duration: number,
    createdAt: Date
    save(): void;
}

export interface VideoBody {
    title: string
}

const videoSchema = new Schema<IVideo>({
    title: {
        type: String,
        minlength: 3,
        maxlength: 50,
        trim: true,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    bytes: {
        type: Number,
        required: true,
    },
    path: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    duration: {
        type: Number,
        required: true
    }

}, {versionKey: false});


export const Video = model<IVideo>('Video', videoSchema);