import {Controller} from "../decorators/controller.decorator";
import {Service} from "typedi";
import {Request, Response} from "express";
import {Logger} from "../lib/logger";
import VideoService from "../services/video.service";
import {Delete, Get, Patch, Post} from "../decorators/route.decorator";
import {objectIDValidator} from "../middlewares/objectID.validator";
import {IPageOptions, MultipartRequest, UploadedFile} from "../constants/types";
import {IVideo, Video} from "../models/video.model";
import {HttpExceptions} from "../exceptions/exceptions";
import {HTTP_CODES} from "../constants/http.codes";


@Service()
@Controller('/videos')
export default class VideoController {

    private readonly logger;

    constructor(private readonly videoService: VideoService) {
        this.logger = Logger.getLogger();
    }

    @Get()
    public async getAllAction(req: Request, res: Response) {

        const pageOptions: IPageOptions = {
            page: parseInt(<string>req.query.page, 10) || 1,
            limit: parseInt(<string>req.query.limit, 10) || 10
        }

        const videos = await this.videoService.paginateVideos(pageOptions)

        return res.json({
            "data": videos,
            "count": videos.length,
            ...pageOptions,
        });
    }

    @Get('/:id', [objectIDValidator])
    public async getOneAction(req: Request, res: Response) {
        const video: IVideo | null = await Video.findById(req.params.id);

        if (!video) {
            throw new HttpExceptions.NotFound('Video not found');
        }

        return res.json(video);
    }

    @Post()
    public async createAction(req: MultipartRequest, res: Response) {

        const file: UploadedFile = req.files.file;
        const video = await this.videoService.createVideo({title: req.body.title, file: file});

        return res
            .status(HTTP_CODES.CREATED)
            .json(video);
    }

    @Delete('/:id', [objectIDValidator])
    public async deleteAction(req: Request, res: Response) {

        await this.videoService.deleteVideo(req.params.id)

        return res
            .status(HTTP_CODES.NO_CONTENT)
            .json({});

    }

    @Patch('/:id', [objectIDValidator])
    public async updateAction(req: Request, res: Response) {

        let video: IVideo | null = await Video.findById(req.params.id);
        if (!video) {
            throw new HttpExceptions.NotFound('Video not found');
        }

        video = await this.videoService.updateVideoData(req.body, video)
        return res.json(video);

    }

    @Get('/:id/stream', [objectIDValidator])
    public async streamAction(req: Request, res: Response) {

        let video: IVideo | null = await Video.findById(req.params.id);
        if (!video) {
            throw new HttpExceptions.NotFound('Video not found');
        }

        const range: string | undefined = req.headers.range;

        if (!range) {
            throw new HttpExceptions.Internal('Range header is required');
        }

        try {
            const {header, videoStream} = this.videoService.openVideoStream(video, range);

            res.writeHead(HTTP_CODES.PARTIAL_CONTENT, header);
            videoStream.pipe(res);

        } catch (error){
            this.logger.error('Undefined error occured while streaming video ' + video._id);
            throw error;
        }

    }
}


