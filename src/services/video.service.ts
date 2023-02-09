import {Service} from "typedi";
import {IVideo, Video} from "../models/video.model";
import {Logger} from "../lib/logger";
import {IPageOptions, IVideoStream, UploadedFile} from "../constants/types";
import {FileService} from "./file.service";
import {VideoDto} from "../dto/video.dto";
import {HttpExceptions} from "../exceptions/exceptions";
import {VideoValidator} from "../validators/video.validator";
import fs from "fs";
import {AwsService} from "./aws.service";

@Service()
export default class VideoService {

    private readonly logger;

    constructor(private readonly fileService: FileService,
                private readonly validator: VideoValidator,
                private readonly awsService: AwsService) {
        this.logger = Logger.getLogger();
    }

    public async createVideo(videoDto: VideoDto): Promise<IVideo> {

        const {error, violations} = this.validator.validate(videoDto);
        if (error) {
            throw new HttpExceptions.BadRequest(violations);
        }
        const file = videoDto.file as UploadedFile;
        const path = this.fileService.uploadFile(file);
        const s3Id = this.awsService.uploadFileToS3(file);
        const videoDuration = await this.fileService.getVideoDuration(file.path);

        return Video.create({
            title: videoDto.title,
            originalName: file.originalFilename,
            path: path,
            bytes: file.size,
            s3Id: s3Id,
            duration: videoDuration
        });

    }

    public async paginateVideos(pageOptions: IPageOptions): Promise<any> {

        return Video.find()
            .select({title: 1})
            .skip((pageOptions.page - 1) * pageOptions.limit)
            .limit(pageOptions.limit);

    }

    public async deleteVideo(id: string) {

        const video: IVideo | null = await Video.findByIdAndRemove(id);

        if (!video) {
            throw new HttpExceptions.NotFound('Video not found');
        }

        this.awsService.removeFileFromS3(video.s3Id);
        this.fileService.deleteFile(video.path);
    }

    public async updateVideoData(videoDto: VideoDto, video: IVideo): Promise<IVideo> {

        const error = this.validator.validateTitleField(videoDto.title);
        if (error) {
            throw new HttpExceptions.BadRequest({error});
        }

        video.title = videoDto.title;
        await video.save();

        return video

    }

    public openVideoStream(video: IVideo, range: string): IVideoStream {
        let [startByte, endByte] = range.replace('bytes=', '').split('-').map((el) => parseInt(el));

        if (!startByte) {
            startByte = 0;
        }

        if (!endByte) {
            endByte = video.bytes - 1;
        }

        const chunkSize = endByte - startByte + 1;
        const videoStream = fs.createReadStream(video.path, {start: startByte, end: endByte});
        const header = {
            'Content-Range': `bytes ${startByte}-${endByte}/${video.bytes}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        };

        return {header, videoStream};

    }
}