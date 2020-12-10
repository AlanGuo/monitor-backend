import {IRouterContext} from "koa-router";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";
import {MEDIA_TYPE, RESPONSE_CODE} from "@src/infrastructure/utils/constants";

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