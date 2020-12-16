import config from "@src/infrastructure/utils/config";
import {Controller, GET} from "@src/infrastructure/decorators/koa";
import KoaRouter, {IRouterContext} from "koa-router";
import {prepareUploadAsset, prepareUploadKyc, prepareUploadMedia} from "@src/infrastructure/amazon/s3";
import {createMediaConvertJob, getJob, getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {getOnlineUser, redis} from "../infrastructure/redis";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";
import { getSignedUrl } from "@src/infrastructure/amazon/cloudfront";
import MediaModel from "@src/models/media";
import {getSocketIO} from "@src/infrastructure/socket";
import {MEDIA_TYPE, RESPONSE_CODE, SOCKET_CHANNEL} from "@src/infrastructure/utils/constants";
import { ImageAmazonUrl, VideoAmazonUrl } from "@src/interface";
import { AuthRequired } from "@src/infrastructure/decorators/auth";

@Controller({prefix: "/media"})
export default class MediaController {
  static router: KoaRouter;

  // requested with http[s]://host:port/api/media/prepare-upload
  @GET("/prepare-upload/:filename")
  @AuthRequired()
  async prepareUpload(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadMedia(filename);
  }

  @GET("/prepare-upload-asset/:filename")
  @AuthRequired()
  async prepareUploadAsset(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadAsset(filename);
  }

  @GET("/prepare-upload-kyc/:filename")
  @AuthRequired()
  async prepareUploadKyc(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadKyc(filename);
  }

  @GET("/getconverted/:filename")
  @AuthRequired()
  async getConvertedFiles(ctx: IRouterContext) {
    const fileName = ctx.params.filename;
    // const fileNameWithoutExt = fileName.split(".")[0];
    const media = await MediaModel.findOne({
      fileName
    });
    if (media) {
      const urls = getMediaUrl(media.type, fileName, true, media.size) as ImageAmazonUrl | VideoAmazonUrl;
      ctx.body = jsonResponse({
        data: {
          type: media.type,
          ...urls,
          // fileName,
          size: media.size
        }
      });
    } else {
      ctx.body = jsonResponse({
        code: RESPONSE_CODE.MEDIA_NOT_FOUND
      });
    }
  }

  // @GET("/signed")
  // async getSignedUrl (ctx: IRouterContext) {
  //   const key = decodeURIComponent(ctx.query.key);
  //   ctx.body = await getSignedUrl(key);
  // }

  @GET("/convert")
  async convert(ctx: IRouterContext) {
    const key = decodeURIComponent(ctx.query.key);
    const ext = key.split(".")[1];
    if (isVideo(ext)) {
      const fileNameWithoutExt = key.split(".")[0].replace(config.AWS_MEDIA_CONVERT.videoSourceFolder, "");
      const s3FilePath = config.AWS_MEDIA_CONVERT.sourcePath + key;
      // 测试环境和正式环境公用aws。这里判断从正式环境才发起Job
      let jobData: any = {
        Job: {
          Id: "trigger in production"
        }
      };
      if (process.env.NODE_ENV === "production") {
        jobData = await createMediaConvertJob(s3FilePath);
      }
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
        // media convertion job, two jobs
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
}
