module.exports = {
  HTTPS_PORT: 3010,
  API_PREFIX: "/api",
  AWS_ACCESS_KEY_ID: "AKIAIDTAHVMP7FT52J7A",
  AWS_SECRET_ACCESS_KEY: "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",
  AWS_REGION: "ap-southeast-1",
  AWS_SIGNATURE_VERSION: "v4",
  AWS_MEDIA_CONVERT: {
    "sourceBucket": "newonlyfans",
    "endpoint": "https://xdwfvckxc.mediaconvert.ap-southeast-1.amazonaws.com",
    "sourcePath": "s3://newonlyfans/",
    "chat_media_folder": "media/chat/",
    "sourceFolder": "video/",
  },
  AWS_S3: {
    prefix: "https://newonlyfans-public.s3-ap-southeast-1.amazonaws.com/medias/",
    screenshot_suffix: "_screenshot.0000000.jpg",
    low_suffix: "_generic_low_mp4_800kbps.mp4",
    hd_suffix: "_generic_hd_mp4_4000kbps.mp4",
    success_action_status: "201",
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

  HOST: "http://localhost:3010"
};
