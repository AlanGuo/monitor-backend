import { connect } from "mongoose";

const { MONGO_DB_CONNECTIONSTRINGURI } = process.env;
export async function dbConnect() {
  if (MONGO_DB_CONNECTIONSTRINGURI) {
    await connect(MONGO_DB_CONNECTIONSTRINGURI, {useNewUrlParser: true, useUnifiedTopology: true});
    console.info("connected to " + MONGO_DB_CONNECTIONSTRINGURI);
  }
}