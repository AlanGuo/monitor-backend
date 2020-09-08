import config from "@src/infrastructure/utils/config"
import RedisStore from "koa-redis";
import {SessionStore} from "koa-generic-session";

let redisStore: SessionStore;

export function loadRedisStore(): SessionStore {
  redisStore = redisStore ||
    RedisStore({
      host: config.REDIS.Host,
      port: config.REDIS.Port,
      password: config.REDIS.Password ?? undefined,
      db: config.REDIS.Store_DB ?? 1
    });
  return redisStore;
}
