// @ts-ignore
import config from "config";
import { MediaConvert } from "aws-sdk";
import { job } from "@config/mediaconvert/job";

const mediaConvert = new MediaConvert({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
  signatureVersion: config.AWS_SIGNATURE_VERSION,
  endpoint: config.AWS_MEDIA_CONVERT.endpoint
});

export async function createMediaConvertJob(s3FilePath: string, purpose: string) {
  job.Settings.Inputs[0].FileInput = s3FilePath;
  job.Settings.OutputGroups[0].OutputGroupSettings.FileGroupSettings.Destination += (purpose + "/")
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
