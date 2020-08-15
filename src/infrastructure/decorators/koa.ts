// @ts-ignore
import config from "config";
import KoaRouter, {IRouterContext} from "koa-router";
import {REQUEST_METHOD} from "@src/infrastructure/utils/constants";
const router = new KoaRouter({prefix: config.API_PREFIX});

function Controller({prefix}: { prefix: string }) {
  return function (target: any) {
    const classPrefix = (prefix ? prefix.replace(/\/+$/g, "") : "");
    target.router = router;
    const reqList = Object.getOwnPropertyDescriptors(target.prototype);
    for (const v in reqList) {
      // 排除类的构造方法
      if (v !== "constructor") {
        const fn = reqList[v].value;
        fn(router, {prefix: classPrefix});
      }
    }
  }
}

function Request({url, method}: { url: string, method: string }) {
  return function (target: any, name: string, descriptor: any) {
    const fn = descriptor.value;
    descriptor.value = (router: any, {prefix}: { prefix: string }) => {
      router[method](prefix + url, async (ctx: IRouterContext, next: any) => {
        await fn(ctx, next);
      })
    }
  }
}

function POST(url: string = "") {
  return Request({url, method: REQUEST_METHOD.POST})
}

//get 请求
function GET(url: string = "") {
  return Request({url, method: REQUEST_METHOD.GET})
}

//PUT 请求
function PUT(url: string = "") {
  return Request({url, method: REQUEST_METHOD.PUT})
}

//DEL请求
function DEL(url: string = "") {
  return Request({url, method: REQUEST_METHOD.DELETE})
}

export {REQUEST_METHOD, Controller, Request, POST, GET, PUT, DEL}
