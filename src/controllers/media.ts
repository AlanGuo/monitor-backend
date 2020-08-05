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

  @GET("/convert")
  async convert(ctx: IRouterContext) {
    const key = decodeURIComponent(ctx.query.key);
    const purpose = ctx.query.purpose;
    const fileNameWithoutExt = key.split(".")[0];
    const s3FilePath = config.AWS_MEDIA_CONVERT.sourcePath + key;
    const jobData: any = await createMediaConvertJob(s3FilePath, purpose);
    // media convertion job, three jobs
    await redis.set(config.AWS_MEDIA_CONVERT[ purpose + "_media_folder" ] + fileNameWithoutExt, JSON.stringify({fileCount: 3, key, subscribers: []}));

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
    const fileName = ctx.params.filename;
    const fileNameWithoutExt = fileName.split(".")[0];
    ctx.body = jsonResponse({
      data: {
        screenshot: config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.screenshot_suffix,
        low: config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.low_suffix,
        hd: config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.hd_suffix,
      }
    });
  }
}