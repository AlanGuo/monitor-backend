module.exports = {
  HTTPS_PORT: 3010,
  API_PREFIX: "/api",
  AWS_ACCESS_KEY_ID: "AKIAIJWSPJGSDUARKOVQ",
  AWS_SECRET_ACCESS_KEY: "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",
  AWS_REGION: "ap-southeast-1",
  AWS_SIGNATURE_VERSION: "v4",
  AWS_MEDIA_CONVERT: {
    "sourceBucket": "newonlyfans",
    "publicBucket": "newonlyfans-public",
    "endpoint": "https://xdwfvckxc.mediaconvert.ap-southeast-1.amazonaws.com",
    "sourcePath": "s3://newonlyfans/",
    "videoDestination": "s3://newonlyfans-public/media/video/",
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
    screenshotSuffix: "_screenshot(540*960).0000000.jpg",
    lowSuffix: "_low_mp4_800kbps(540*960).mp4",
    hdSuffix: "_hd_mp4_4000kbps(1080*1920).mp4",
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
    clientId:"AWJ18jbDJ0f11jkoMbKfonnW-YfcyweVc73COBOxeYIONSkyuiIOhgr_v0Q4elyAptjbEEbr1M5H3ZWv",
    clientSecret:"EEBTsHvdFdxvhGY3Jwq2OIoeI_7GkGdSCe-Bwbcu-pJI0v0Eba3d_R1EIZhH5tkYQTmizl99_qBAfUbz",
    mode: "sandbox",
    paymentWebhookId: "9FF26720B8007994B"
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

  HOST: "https://test-justfans.bitapp.net",

  RABBITMQ: "amqp://localhost:5672"

};
