import {Controller} from "../decorators/controller.decorator";
import {Service} from "typedi";
import {Request, Response} from "express";
import {Logger} from "../lib/logger";
import VideoService from "../services/video.service";
import {Get, Post} from "../decorators/route.decorator";
import {objectIDValidator} from "../middlewares/objectID.validator";

@Controller('/videos')
@Service()
export default class VideoController {

    private readonly logger;

    constructor(private readonly videoService: VideoService) {
        this.logger = Logger.getLogger();
    }


    @Get('/:id', [objectIDValidator])
    public async getOneAction(req: Request, res: Response) {
        const video = await this.videoService.findVideo(req.params.id);
        this.logger.info(req.params.id);
        res.send(video);

    }

    @Post('/')
    public async createAction(req: Request, res: Response) {
        this.logger.info(req.body);
        const video = await this.videoService.createVideo(req.body);

        res.send(video);
    }

}