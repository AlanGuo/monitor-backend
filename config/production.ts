module.exports = {
  HTTPS_PORT: 3010,
  API_PREFIX: "/api",
  DEPTH_LIMIT: 10000,

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
    arbitrage: {
      name: "abtg",
      db: "abtg-perp-prod-2022-04-01",
      connectionString: "mongodb://localhost:27017"
    },
    loan: {
      name: "loan",
      db: "crypto-loan-2022-04-15",
      connectionString: "mongodb://localhost:27017"
    }
  },
  HOST: "https://monitor.openholder.com"
};
