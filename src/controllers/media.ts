// @ts-ignore
import config from "config";
import {Controller, GET} from "@src/infrastructure/decorators/koa";
import KoaRouter, {IRouterContext} from "koa-router";
import {prepareUploadMedia} from "@src/infrastructure/amazon/s3";
import {createMediaConvertJob, getJob} from "@src/infrastructure/amazon/mediaConvert";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {redis} from "../infrastructure/redis";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";
import {AuthRequired} from "@src/infrastructure/decorators/auth";

@Controller({prefix: "/media"})
export default class MediaController {
  static router: KoaRouter;

  // requested with http[s]://host:port/api/media/prepare-upload
  @GET("/prepare-upload/:filename")
  async prepareUpload(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadMedia(filename);
  }

  @GET("/convert")
  @AuthRequired()
  async convert(ctx: IRouterContext) {
    const key = decodeURIComponent(ctx.query.key);
    const ext = key.split(".")[1];
    if (isVideo(ext)) {
      const fileNameWithoutExt = key.split(".")[0].replace(config.AWS_MEDIA_CONVERT.videoSourceFolder, "");
      const s3FilePath = config.AWS_MEDIA_CONVERT.sourcePath + key;
      const jobData: any = await createMediaConvertJob(s3FilePath);
      const data = await redis.get(config.AWS_MEDIA_CONVERT.videoFolder + fileNameWithoutExt);
      if (data) {
        const decodedData = JSON.parse(data);
        decodedData.fileCount = 3;
        decodedData.key = key;
        await redis.set(config.AWS_MEDIA_CONVERT.videoFolder + fileNameWithoutExt, JSON.stringify(decodedData));
      } else {
        // media convertion job, three jobs
        await redis.set(config.AWS_MEDIA_CONVERT.videoFolder + fileNameWithoutExt, JSON.stringify({
          fileCount: 3,
          key,
          subscribers: []
        }));
      }
      
      ctx.body = jsonResponse({
        data: {
          jobId: jobData.Job.Id,
        }
      });
    } else if (isImage(ext)) {
      const fileNameWithoutExt = key.split(".")[0].replace(config.AWS_MEDIA_CONVERT.imageSourceFolder, "");
      const data = await redis.get(config.AWS_MEDIA_CONVERT.imageFolder + fileNameWithoutExt);
      if (data) {
        const decodedData = JSON.parse(data);
        decodedData.fileCount = 1;
        decodedData.key = key;
        await redis.set(config.AWS_MEDIA_CONVERT.imageFolder + fileNameWithoutExt, JSON.stringify(decodedData));
      } else {
        await redis.set(config.AWS_MEDIA_CONVERT.imageFolder + fileNameWithoutExt, JSON.stringify({
          fileCount: 1,
          key,
          subscribers: []
        }));
      }
      ctx.body = jsonResponse();
    }
  }

  @GET("/getjob/:id")
  async getJob(ctx: IRouterContext) {
    const id = ctx.params.id;
    ctx.body = await getJob(id);
  }

  @GET("/getconverted/:filename")
  async getConvertedFiles(ctx: IRouterContext) {
    const fileName = ctx.params.filename;
    const fileNameWithoutExt = fileName.split(".")[0];
    ctx.body = jsonResponse({
      data: {
        screenshot: config.AWS_S3.videoPrefix + fileNameWithoutExt + config.AWS_S3.screenshotSuffix,
        low: config.AWS_S3.videoPrefix + fileNameWithoutExt + config.AWS_S3.lowSuffix,
        hd: config.AWS_S3.videoPrefix + fileNameWithoutExt + config.AWS_S3.hdSuffix,
      }
    });
  }
}
