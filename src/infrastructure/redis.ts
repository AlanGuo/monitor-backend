// @ts-ignore
import config from "config";
import Redis from "ioredis";
import {ONLINE_USER_KEY} from "@src/infrastructure/utils/constants";

export const redis = config.REDIS.Password ? new Redis({
  host: config.REDIS.Host,
  port: config.REDIS.Port,
  db: config.REDIS.DB || 0,
  password: config.REDIS.Password
}) : new Redis({
  host: config.REDIS.Host,
  port: config.REDIS.Port,
  db: config.REDIS.DB,
});


export async function setOnlineUser(userId: string, sid: string) {
  await redis.hset(ONLINE_USER_KEY, userId, sid)
}

export async function getOnlineUser(userId: string) {
  return await redis.hget(ONLINE_USER_KEY, userId)
}

export async function delOnlineUser(userId: string) {
  await redis.hdel(ONLINE_USER_KEY, userId)
}
