// @ts-ignore
import config from "config";
import { Controller, GET } from "@src/infrastructure/decorators/koa";
import KoaRouter, { IRouterContext } from "koa-router";
import { prepareUploadMedia } from "@src/infrastructure/amazon/s3";
import { createMediaConvertJob, getJob } from "@src/infrastructure/amazon/mediaConvert";
import { jsonResponse } from "@src/infrastructure/utils/helper";
import { redis } from "../infrastructure/redis"; 

@Controller({ prefix: "/media" })
export default class MediaController {
  static router: KoaRouter;
  // requested with http[s]://host:port/api/media/prepare-upload
  @GET("/prepare-upload/:filename")
  async prepareUpload(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadMedia(filename);
  }

  @GET("/convert/:filename")
  async convert(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    const purpose = ctx.params.purpose;
    const fileNameWithoutExt = filename.split(".")[0];
    const s3FilePath = config.AWS_MEDIA_CONVERT.sourcePath + filename;
    const jobData: any = await createMediaConvertJob(s3FilePath);
    // media convertion job, three jobs
    await redis.set(config.AWS_S3[ purpose + "_media_folder" ] + fileNameWithoutExt, JSON.stringify({fileCount: 3, fileName: filename, subscribers: []}));

    ctx.body = jsonResponse({
      data: {
        jobId: jobData.Job.Id,
      }
    });
  }

  @GET("/getjob/:id")
  async getJob(ctx: IRouterContext) {
    const id = ctx.params.id;
    ctx.body = await getJob(id);
  }

  @GET("/getconverted/:filename")
  async getConvertedFiles(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    const fileNameWithoutExt = filename.split(".")[0];
    ctx.body = jsonResponse({
      data: {
        screenshot: config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.screenshot_suffix,
        low: config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.low_suffix,
        hd: config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.hd_suffix,
      }
    });
  }
}