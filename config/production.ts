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
    addedBalance: 0,
    bnb: 1,
    bnbPrice: 400
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
    DB: "abtg-perp-prod-2022-04-01",
    Connection_String_URI: "mongodb://localhost:27017"
  },
  HOST: "https://monitor.openholder.com"
};
