import {Service} from "typedi";
import {Video, IVideo} from "../models/video.model";
import {Logger} from "../lib/logger";
import {IPageOptions, UploadedFile} from "../constants/types";
import {FileService} from "./file.service";
import {VideoDto} from "../dto/video.dto";
import {HttpExceptions} from "../exceptions/exceptions";
import getVideoDurationInSeconds from "get-video-duration";
import {VideoValidator} from "../validators/video.validator";

@Service()
export default class VideoService {

    private readonly logger;

    constructor(private readonly fileService: FileService,
                private readonly validator: VideoValidator) {
        this.logger = Logger.getLogger();
    }

    public async createVideo(videoDto: VideoDto): Promise<IVideo> {

        const {error, violations} = this.validator.validate(videoDto);
        if (error) {
            throw new HttpExceptions.BadRequest(violations);
        }
        const file = videoDto.file as UploadedFile;
        const path = this.fileService.uploadFile(file);
        const videoDuration = await getVideoDurationInSeconds(file.path);

        return Video.create({
            title: videoDto.title,
            originalName: file.originalFilename,
            path: path,
            bytes: file.size,
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

}