import config from "@src/infrastructure/utils/config";
import { Connection, createConnection } from "mongoose";

function arbitrageDBConnect(test = false): Connection {
  const conf = config.MONGODB.arbitrage;
  const url = conf.Connection_String_URI;
  return createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    autoCreate: false,
    dbName: conf.DB,
  });
}

function loanDBConnect(test = false): Connection {
  const conf = config.MONGODB.loan;
  const url = conf.Connection_String_URI;
  return createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    autoCreate: false,
    dbName: conf.DB,
  });
}

export const arbitrageDBConn = loanDBConnect();
export const loanDBConn = loanDBConnect();