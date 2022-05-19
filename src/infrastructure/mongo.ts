import config from "@src/infrastructure/utils/config";
import { Connection, createConnection } from "mongoose";

function arbitrageDBConnect(test = false): Connection {
  const conf = config.MONGODB.arbitrage;
  const url = conf.connectionString;
  return createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    autoCreate: false,
    dbName: conf.db,
  });
}

function loanDBConnect(test = false): Connection {
  const conf = config.MONGODB.loan;
  const url = conf.connectionString;
  return createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: false,
    autoCreate: false,
    dbName: conf.db,
  });
}

export const loanDBConn = loanDBConnect();
export const arbitrageDBConn = arbitrageDBConnect();