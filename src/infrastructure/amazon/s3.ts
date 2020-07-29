import { S3 } from "aws-sdk";
import { newUniqId } from "@src/infrastructure/utils/uuid";
import path from "path";
const { SOURCE_MEDIA_BUCKET, MEDIA_FOLDER } = process.env;

const s3: S3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-1",
  signatureVersion: "v4",
});

export async function prepareUploadMedia(filename: string){
  const id = newUniqId() + path.extname(filename);
  return new Promise((res, rej) => {
    s3.createPresignedPost({
      Bucket: SOURCE_MEDIA_BUCKET,
      Fields: {
        key: MEDIA_FOLDER + `${id}`,
        success_action_status: "201"
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