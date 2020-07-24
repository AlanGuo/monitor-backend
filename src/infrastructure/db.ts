import { Sequelize } from "sequelize-typescript";
import path from "path";

export function businessDBConnect(db:string){
  const connection = new Sequelize({
    dialect: "mysql",
    host: "virginia-livestar-prod-db.coa1oedbrubs.us-east-1.rds.amazonaws.com",
    port: 3306,
    username: "root",
    password: "RrlEqn2#fe5",
    database: db,
    logging: false,
    models: [path.resolve(__dirname, "../models")]
  })
  return connection;
}


export function currencyDBConnection(db:string){
  const connection = new Sequelize({
    dialect: "mysql",
    host: "10.0.1.7",
    port: 3306,
    username: "root",
    password: "admin#etl",
    database: db,
    logging: false,
    models: [path.resolve(__dirname, "../models")]
  })

  return connection;
}