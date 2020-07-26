import Redis from "ioredis";

const { REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_PASS } = process.env;
export const redis = new Redis(
  Number(REDIS_PORT),
  REDIS_HOST
)
