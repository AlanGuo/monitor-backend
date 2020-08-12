import {pbkdf2, randomBytes} from "crypto";
import {redis} from "../redis";
import {AUTH_TOKEN_OVERDUE_SECOND} from "@src/infrastructure/utils/constants";

interface IGenerateAuth {
  hash: string,
  salt?: string,
  timestamp: number
}

interface IGenerateAuthParams {
  content: string,
  length?: number,
  saltLength?: number,
  saltString?: string,
  timestamp?: number
}

export async function generateAuth(params: IGenerateAuthParams): Promise<IGenerateAuth> {
  const timestamp = params.timestamp || +new Date();
  return new Promise(function (resolve, reject) {
    if (params.saltString) {
      pbkdf2(
        (params.content || "") + timestamp.toString(),
        params.saltString, 4096,
        params.length ?? 64,
        "sha256",
        function (err, hash) {
          if (err) { reject(err) }
          resolve({hash: hash.toString("hex"), salt: params.saltString, timestamp: Number(timestamp)})
        })
    } else {
      randomBytes(params.saltLength || 128, function (err, salt) {
        if (err) { reject(err) }
        const saltString = salt.toString("hex");
        pbkdf2(
          (params.content || "") + timestamp.toString(),
          saltString, 4096,
          params.length ?? 64,
          "sha256",
          function (err, hash) {
            if (err) { reject(err) }
            resolve({hash: hash.toString("hex"), salt: saltString, timestamp: Number(timestamp)})
          })
      })
    }
  })
}

export async function generateToken(uuid: Number) {
  const token = await generateAuth({content: `${uuid}${Math.random()}`, saltLength: 128});
  const key = getAuthKey(uuid);
  const now = Date.now();
  await redis.set(key, JSON.stringify({token: token.hash, time: now}));
  await redis.expire(key, AUTH_TOKEN_OVERDUE_SECOND);
  return token.salt;
}

export async function checkAuth(auth: string) {

}

export function getAuthKey(uuid: Number) {
  return `auth_${uuid}`
}
