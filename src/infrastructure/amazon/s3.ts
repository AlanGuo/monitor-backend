// @ts-ignore
import config from "config";
import {S3} from "aws-sdk";
import {newUniqId} from "@src/infrastructure/utils/uuid";
import path from "path";

const s3: S3 = new S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
  signatureVersion: config.AWS_SIGNATURE_VERSION,
});

export async function prepareUploadMedia(filename: string) {
  const id = newUniqId() + path.extname(filename);
  return new Promise((res, rej) => {
    s3.createPresignedPost({
      Bucket: config.SOURCE_MEDIA_BUCKET,
      Fields: {
        key: config.MEDIA_FOLDER + `${id}`,
        success_action_status: config.AWS_S3.success_action_status
      }
    }, (err, data) => {
      if (err) {
        rej(err)
      } else {
        res(data);
      }
    })
  });
}
