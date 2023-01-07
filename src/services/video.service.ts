import {Service} from "typedi";
import {Video, IVideo} from "../models/video.model";
import {Logger} from "../lib/logger";

@Service()
export default class VideoService {

    private readonly logger;

    constructor() {
        this.logger = Logger.getLogger();
    }

    public createVideo(body: IVideo): Promise<IVideo> {

        this.logger.info(body);

        return Video.create({
            title: body.title,
            filename: body.filename
        })
    }

    public findVideo(id: string) {
        return Video.findById(id);
    }
}