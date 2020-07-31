// @ts-ignore
import config from 'config';
import Redis from "ioredis";

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
