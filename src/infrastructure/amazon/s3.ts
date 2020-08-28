// @ts-ignore
import config from "config";
import {S3} from "aws-sdk";
import path from "path";
import {newUniqId, newUuid} from "@src/infrastructure/utils/uuid";
import { isImage } from "@src/infrastructure/utils/image";
import { isVideo } from "@src/infrastructure/utils/video"

const s3: S3 = new S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
  signatureVersion: config.AWS_SIGNATURE_VERSION,
});

export async function prepareUploadMedia(filename: string) {
  const ext = path.extname(filename);
  const id = newUuid() + ext;
  let sourcePath = config.AWS_MEDIA_CONVERT.otherSourceFolder;
  if (isImage(ext)) {
    sourcePath = config.AWS_MEDIA_CONVERT.imageSourceFolder;
  } else if(isVideo(ext)) {
    sourcePath = config.AWS_MEDIA_CONVERT.videoSourceFolder;
  }
  return new Promise((res, rej) => {
    s3.createPresignedPost({
      Bucket: config.AWS_MEDIA_CONVERT.sourceBucket,
      Fields: {
        key: sourcePath + `${id}`,
        success_action_status: config.AWS_S3.successActionStatus,
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
