module.exports = {
  HTTPS_PORT: 3010,
  API_PREFIX: "/api",
  AWS_ACCESS_KEY_ID: "AKIAIJWSPJGSDUARKOVQ",
  AWS_SECRET_ACCESS_KEY: "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",
  AWS_REGION: "ap-southeast-1",
  AWS_SIGNATURE_VERSION: "v4",
  AWS_MEDIA_CONVERT: {
    "sourceBucket": "newonlyfans",
    "endpoint": "https://xdwfvckxc.mediaconvert.ap-southeast-1.amazonaws.com",
    "sourcePath": "s3://newonlyfans/",
    "videoDestination": "s3://newonlyfans-public/media/video/",
    "imageFolder": "media/image/",
    "videoFolder": "media/video/",
    "videoSourceFolder": "video/",
    "imageSourceFolder": "image/",
    "otherSourceFolder": "other/",
  },
  AWS_S3: {
    videoPrefix: "https://newonlyfans-public.s3-ap-southeast-1.amazonaws.com/media/video/",
    imagePrefix: "https://newonlyfans-public.s3-ap-southeast-1.amazonaws.com/media/image/",
    screenshotSuffix: "_screenshot.0000000.jpg",
    lowSuffix: "_generic_low_mp4_800kbps.mp4",
    hdSuffix: "_generic_hd_mp4_4000kbps.mp4",
    successActionStatus: "201",
  },
  AWS_CLOUDFRONT: {
    keyPairId: "APKAJH6JUHUQ35LPLWOA",
    url: "https://d361bamx0sbpue.cloudfront.net/",
    // 一小时
    timeLimit: 3600 * 1000
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
    Connection_String_URI: "mongodb://127.0.0.1:27017/justfans",
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
  HOST: "http://local.justfans.com",

  RABBITMQ: "amqp://localhost:5672"
};
