import config from "@src/infrastructure/utils/config";
import {Controller, GET} from "@src/infrastructure/decorators/koa";
import KoaRouter, {IRouterContext} from "koa-router";
import {prepareUploadAsset, prepareUploadKyc, prepareUploadMedia} from "@src/infrastructure/amazon/s3";
import {createMediaConvertJob, getJob} from "@src/infrastructure/amazon/mediaConvert";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {getOnlineUser, redis} from "../infrastructure/redis";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";
import { getSignedUrl } from "@src/infrastructure/amazon/cloudfront";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {getSocketIO} from "@src/infrastructure/socket";
import {SOCKET_CHANNEL} from "@src/infrastructure/utils/constants";

@Controller({prefix: "/media"})
export default class MediaController {
  static router: KoaRouter;

  // requested with http[s]://host:port/api/media/prepare-upload
  @GET("/prepare-upload/:filename")
  async prepareUpload(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadMedia(filename);
  }

  @GET("/prepare-upload-asset/:filename")
  async prepareUploadAsset(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadAsset(filename);
  }

  @GET("/prepare-upload-kyc/:filename")
  async prepareUploadKyc(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadKyc(filename);
  }

  @GET("/convert")
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
        decodedData.fileCount = 2;
        decodedData.key = key;
        await redis.set(config.AWS_MEDIA_CONVERT.videoFolder + fileNameWithoutExt, JSON.stringify(decodedData));
        // SOCKET_CHANNEL.MEDIA_CONVERT before the s3 call convert
        const io = getSocketIO();
        const toSid = await getOnlineUser(decodedData.owner);
        if (toSid) {
          io.sockets.connected[toSid]?.emit(SOCKET_CHANNEL.MEDIA_CONVERT_START, JSON.stringify({fileName: fileNameWithoutExt}))
        } else {
          console.log("/convert video: user offline", decodedData.owner)
        }
      } else {
        console.log("/convert video: not data")
        // media convertion job, three jobs
        await redis.set(config.AWS_MEDIA_CONVERT.videoFolder + fileNameWithoutExt, JSON.stringify({
          // only two jobs
          fileCount: 2,
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
        decodedData.fileCount = 3;
        decodedData.key = key;
        await redis.set(config.AWS_MEDIA_CONVERT.imageFolder + fileNameWithoutExt, JSON.stringify(decodedData));
        // SOCKET_CHANNEL.MEDIA_CONVERT before the s3 call convert
        const io = getSocketIO();
        const toSid = await getOnlineUser(decodedData.owner);
        if (toSid) {
          io.sockets.connected[toSid]?.emit(SOCKET_CHANNEL.MEDIA_CONVERT_START, JSON.stringify({fileName: fileNameWithoutExt}))
        } else {
          console.log("/convert image: user offline", decodedData.owner)
        }
      } else {
        console.log("/convert image: not data")
        await redis.set(config.AWS_MEDIA_CONVERT.imageFolder + fileNameWithoutExt, JSON.stringify({
          // only two jobs
          fileCount: 3,
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

  @GET("/signed")
  async getSignedUrl (ctx: IRouterContext) {
    const key = decodeURIComponent(ctx.query.key);
    ctx.body = await getSignedUrl(key);
  }
}
