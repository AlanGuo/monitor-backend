import { Controller, GET } from "@src/infrastructure/decorators/koa";
import KoaRouter, { IRouterContext } from "koa-router";
import { prepareUploadMedia } from "@src/infrastructure/amazon/s3";

@Controller({ prefix: "/media" })
export default class MediaController {
  static router: KoaRouter;
  // requested with http[s]://host:port/api/media/prepare-upload
  @GET("/prepare-upload/:filename")
  async hello(ctx: IRouterContext) {
    const filename = ctx.params.filename;
    ctx.body = await prepareUploadMedia(filename);
  }
}