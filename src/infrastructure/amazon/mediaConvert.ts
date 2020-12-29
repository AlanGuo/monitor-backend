import config from "@src/infrastructure/utils/config";
import {MediaConvert} from "aws-sdk";
import {job} from "@config/mediaconvert/job";
import {ISize, MEDIA_TYPE} from "@src/infrastructure/utils/constants";
import {ImageAmazonUrl, VideoAmazonUrl} from "@src/interface";
import {getSignedUrl} from "./cloudfront";
import { GetJobResponse } from "aws-sdk/clients/mediaconvert";

const mediaConvert = new MediaConvert({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
  signatureVersion: config.AWS_SIGNATURE_VERSION,
  endpoint: config.AWS_MEDIA_CONVERT.endpoint
});

export async function createMediaConvertJob(s3FilePath: string, uuid: string) {
  job.Settings.Inputs[0].FileInput = s3FilePath;
  job.Settings.Inputs[0].ImageInserter.InsertableImages[0].ImageInserterInput = `s3://newonlyfans/asset/image/${process.env.NODE_ENV}-${uuid}.png`;
  job.Settings.OutputGroups[0].OutputGroupSettings.FileGroupSettings.Destination = config.AWS_MEDIA_CONVERT.videoDestination;
  
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

export async function getJob(jobId: string): Promise<GetJobResponse> {
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

export function getMediaUrl(type: MEDIA_TYPE, fileName: string, payment = true, size?: ISize): ImageAmazonUrl | VideoAmazonUrl {
  switch (type) {
    case MEDIA_TYPE.IMAGE:
      return payment ?
        {
          url: getSignedUrl(`${config.AWS_S3.imagePrefix}${fileName.replace(".", `_(${size?.image![0]}*${size?.image![1]}).`)}`),
          thumbnail: getSignedUrl(`${config.AWS_S3.imagePrefix}${fileName.replace(".", `_thumbnail(${size?.thumbnail![0]}*${size?.thumbnail![1]}).`)}`)
        }
        : {glass: getSignedUrl(`${config.AWS_S3.imagePrefix}${fileName.replace(".", `_glass(${size?.glass![0]}*${size?.glass![1]}).`)}`)};
    case MEDIA_TYPE.VIDEO:
      const file = fileName.split(".")[0]
      return payment ? {
        screenshot: getSignedUrl(`${config.AWS_S3.videoPrefix}${file}_screenshot(${size?.screenshot![0]}*${size?.screenshot![1]}).0000000.jpg`),
        low: getSignedUrl(`${config.AWS_S3.videoPrefix}${file}_low_mp4_800kbps(${size?.low![0]}*${size?.low![1]}).mp4`)
        // hd: getSignedUrl(config.AWS_S3.videoPrefix + file + config.AWS_S3.hdSuffix),
      } : {
        screenshot: getSignedUrl(`${config.AWS_S3.videoPrefix}${file}_screenshot(${size?.screenshot![0]}*${size?.screenshot![1]}).0000000.jpg`)
      };
    default:
      throw Error("media type not exists")
  }
}

export function getMediaFileName(type: MEDIA_TYPE, key: string) {
  // return type === MEDIA_TYPE.VIDEO ? key.split("/")[1].split('.')[0] : key.split("/")[1]
  return key.split("/")[1]
}