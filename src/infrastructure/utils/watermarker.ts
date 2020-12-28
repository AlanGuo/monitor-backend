import { IUser } from "@src/models/user";
import config from "@src/infrastructure/utils/config";
import { createCanvas } from "canvas";
import { uploadUserWaterMarker } from "../amazon/s3";
const canvas = createCanvas(300, 100);
const ctx = canvas.getContext("2d")

const createWaterMarker = (user: IUser) => {
  const name = user.name ?? user.uuid;
  const host = config.HOST;
  const fullText= host + "/user/" + name;
  ctx.font = "14px Arial";
  ctx.fillText(fullText, 0, 10);
  return canvas.toBuffer();
}

export const createUserWatermarker = async (user: IUser) => {
  const blob = await createWaterMarker(user);
  await uploadUserWaterMarker(process.env.NODE_ENV + "-" + user.uuid.toString(), blob);
}