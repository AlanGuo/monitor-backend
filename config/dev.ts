module.exports = {
  HTTPS_PORT: 3010,
  API_PREFIX: "/api",

  CORS: {
    origin: "*"
  },
  WEBSOCKET:{
    origins: "*:*"
  },

  FINACIAL: {
    balance: 10000
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
    DB: "arbetrage-engine",
    Connection_String_URI: "mongodb://localhost:27017"
  },
  HOST: "https://localmonitor.bitapp.com"
};
