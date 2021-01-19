module.exports = {
  HTTPS_PORT: 3010,
  API_PREFIX: "/api",
  AWS_ACCESS_KEY_ID: "AKIAIHVEYPCNA2IPRS2A",
  AWS_SECRET_ACCESS_KEY: "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",
  AWS_REGION: "ap-southeast-1",
  AWS_SIGNATURE_VERSION: "v4",
  AWS_MEDIA_CONVERT: {
    "sourceBucket": "newonlyfans",
    "publicBucket": "newonlyfans-public",
    "endpoint": "https://xdwfvckxc.mediaconvert.ap-southeast-1.amazonaws.com",
    "sourcePath": "s3://newonlyfans/",
    "videoDestination": "s3://newonlyfans-public/media/video/",
    "kycFolder": "kyc/",
    "imageFolder": "media/image/",
    "videoFolder": "media/video/",
    "videoSourceFolder": "video/",
    "imageSourceFolder": "image/",
    "otherSourceFolder": "other/",
    "imageAssetFolder": "asset/image/",
    "otherAssetFolder": "asset/other",
  },
  AWS_S3: {
    videoPrefix: "media/video/",
    imagePrefix: "media/image/",
    successActionStatus: "201",
  },
  AWS_CLOUDFRONT: {
    keyPairId: "APKAJH6JUHUQ35LPLWOA",
    url: "https://d361bamx0sbpue.cloudfront.net/",
    // 一小时
    timeLimit: 3600 * 1000
  },
  PAYPAL: {
    payment: {
      name: "MFans Deposit",
      currency: "usd",
      sign: "$"
    },
    clientId:"AQA0EUqrCsRB0MPas5nj6jEUYmDfZzT_K-P7nw77pggqOsQThlqYlA9pxNwBIG1Cc8vMROnbJzn5O2Nr",
    clientSecret:"EA3l_-P8cZO-sBtRfWpHB9jn_4_nZRQB_SohZTvzjDBf98SdtAr7iLXHsZMw0RMBsqnraxc_-4BNzZQy",
    mode: "live",
    paymentWebhookId: "6P538784XB049535H"
  },
  PAYONEER: {
    host: "https://api.payoneer.com",
    clientId: "100145870",
    auth: "Basic TWZhbnM1ODcwOlB2M3lSMUpmVEcxZQ==" 
  },
  CORS: {
    origin: "*"
  },
  WEBSOCKET:{
    origins: "*:*"
  },

  REDIS: {
    Host: "127.0.0.1",
    Port: 6379,
    DB: 4,
    Store_DB: 3,
    Password: ""
  },

  MONGODB: {
    Name: "prod",
    DB: "mfans",
    ReplicaSet: "mongo_replSet",
    Connection_String_URI: "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/",
    Connection_String_URI_Test: "mongodb://127.0.0.1:27017/mfans_test"
  },

  FACEBOOK: {
    Client_Id: "655262948733316",
    Client_Secret: "f06ba90fee71da9a44b0157458dba71e"
  },

  GOOGLE: {
    Client_Id: "1052017968406-dl4i8ksmjajdo9en9b721qukn6rborou.apps.googleusercontent.com",
    Client_Secret: "T7CEuWOjZA8CHfHC7k1mrh_W",
  },

  TWITTER: {
    Consumer_Key: "",
    Consumer_Secret: ""
  },

  HOST: "https://mfans.com",
  RABBITMQ: "amqp://localhost:5672",
  SLACK_WEB_HOOK: "https://hooks.slack.com/services/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"
};
