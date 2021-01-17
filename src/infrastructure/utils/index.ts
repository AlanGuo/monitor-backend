import {IRouterContext} from "koa-router";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";
import {MEDIA_TYPE, PAYONEER_PAYEES_STATUS, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import axios from "axios";
import config from "@src/infrastructure/utils/config";

export function jsonResponse({data, code, msg}: { data?: any, code?: number | string, msg?: string } = {}) {
  return {
    code: code || RESPONSE_CODE.NORMAL,
    data: data ? data : undefined,
    msg: msg || ""
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function queryToPagination({page = 1, size = 50}) {
  size = Number(size);
  size = size > 500 ? 500 : size;

  return {
    offset: (page - 1) * size,
    limit: size,
    page: Number(page),
    size: size
  }
}

export function unauthorized(ctx: IRouterContext) {
  ctx.throw(401, "Unauthorized");
}

export function mediaType(ext: string): {
  type: MEDIA_TYPE.VIDEO | MEDIA_TYPE.IMAGE,
  confKey: "videoFolder" | "imageFolder",
  sourceFolder: "videoSourceFolder" | "imageSourceFolder"
} {
  if (isVideo(ext)) {
    return {
      type: MEDIA_TYPE.VIDEO,
      confKey: "videoFolder",
      sourceFolder: "videoSourceFolder"
    }
  } else if (isImage(ext)) {
    return {
      type: MEDIA_TYPE.IMAGE,
      confKey: "imageFolder",
      sourceFolder: "imageSourceFolder"
    }
  } else {
    throw Error("can't recognize media type: " + ext)
  }
}

export async function checkPayoneerUserStatus(uuid: number): Promise<PAYONEER_PAYEES_STATUS>  {
  const url = `${config.PAYONEER.host}/v2/programs/100145870/payees/${uuid}/status`;
  const res = await axios.get(url, {
    validateStatus: () => true,
    headers: {
      "Authorization": config.PAYONEER.auth
    },
  });
  if (res.status === 200) {
    return res.data.status as PAYONEER_PAYEES_STATUS
  } else {
    return PAYONEER_PAYEES_STATUS.NOT_EXISTS
  }
}