import { S3 } from "aws-sdk";

const s3: S3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-1",
  signatureVersion: "v4",
});
const VIDEO_FOLDER  = "video/"

s3.createPresignedPost({
  Bucket: "newonlyfans",
  Fields: {
    key: VIDEO_FOLDER + "sample.mp4",
    success_action_status: "201"
  }
}, (err, data) => {
  console.log(data);
})