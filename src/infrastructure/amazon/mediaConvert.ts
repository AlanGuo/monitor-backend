// @ts-ignore
import config from "config";
import {MediaConvert} from "aws-sdk";
import {job} from "@config/mediaconvert/job";
import {MEDIA_PURPOSE, MEDIA_TYPE} from "@src/infrastructure/utils/constants";
import {ImageAmazonUrl, VideoAmazonUrl} from "@src/interface";

const mediaConvert = new MediaConvert({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
  signatureVersion: config.AWS_SIGNATURE_VERSION,
  endpoint: config.AWS_MEDIA_CONVERT.endpoint
});

export async function createMediaConvertJob(s3FilePath: string, purpose: string) {
  job.Settings.Inputs[0].FileInput = s3FilePath;
  job.Settings.OutputGroups[0].OutputGroupSettings.FileGroupSettings.Destination =
  config.AWS_MEDIA_CONVERT.videoDestination + (purpose + "/")
  return new Promise((res, rej) => {
    mediaConvert.createJob(job, (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data);
      }
    })
  })
}

export async function getJob(jobId: string) {
  return new Promise((res, rej) => {
    mediaConvert.getJob({
      Id: jobId
    }, (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data);
      }
    })
  });
}

export function getMediaUrl(type: MEDIA_TYPE, fileName: string, purpose?: MEDIA_PURPOSE): ImageAmazonUrl | VideoAmazonUrl {
  switch (type) {
    case MEDIA_TYPE.IMAGE:
      return { url:config.AWS_S3.imagePrefix + fileName};
    case MEDIA_TYPE.VIDEO:
      if (!purpose) {
        throw Error("video type must have purpose params")
      }
      return {
        screenshot: config.AWS_S3.videoPrefix + purpose + "/" + fileName + config.AWS_S3.screenshotSuffix,
        low: config.AWS_S3.videoPrefix + purpose + "/" + fileName + config.AWS_S3.lowSuffix,
        hd: config.AWS_S3.videoPrefix + purpose + "/" + fileName + config.AWS_S3.hdSuffix,
      };
    default:
      throw Error("media type not exists")
  }
}
