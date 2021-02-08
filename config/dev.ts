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
    clientId:"ASxYRUUiBhtZpOWIDp0TvBTBIJrEZ3cLkaTdDVMnGHh7dvVdK9Lfdcoq5JE_PuYSfcy0zZIAJx4Dz1Qb",
    clientSecret:"EOngEI3YUqc3Hmd4z9m1s5f7-bB-ebwVYbFtGkxcHHnohr9Pv_s5z5GIpgetwTxJv_fesufxeMZn3On5",
    mode: "sandbox",
    paymentWebhookId: "5SP14148UK6362244"
  },
  PAYONEER: {
    host: "https://api.sandbox.payoneer.com",
    clientId: "100145870",
    auth: "Basic TWZhbnM1ODcwOkR3SjRGTzU0Q0Zneg==" 
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
    Name: "dev",
    DB: "justfans",
    ReplicaSet: "mongo_replSet",
    Connection_String_URI: "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/",
    Connection_String_URI_Test: "mongodb://127.0.0.1:27017/justfans_test"
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

  // HOST: "http://localhost:3010"
  HOST: "https://local.mfans.com",

  RABBITMQ: "amqp://localhost:5672",
  SLACK_KYC_HOOK: "https://hooks.slack.com/services/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",
  SLACK_DEPOSIT_HOOK: "https://hooks.slack.com/services/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",
  SLACK_SUB_HOOK: "https://hooks.slack.com/services/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",
  SLACK_TIP_HOOK: "https://hooks.slack.com/services/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",
  SLACK_UNLOCK_HOOK: "https://hooks.slack.com/services/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",
  SLACK_POST_HOOK: "https://hooks.slack.com/services/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"
};
