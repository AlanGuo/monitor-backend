import config from "@src/infrastructure/utils/config";
import {connect} from "mongoose";

export async function dbConnect(test = false): Promise<void> {
  const url = config.MONGODB.Connection_String_URI;
  await connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoCreate: false,
      dbName: config.MONGODB.DB
    });
  console.log(`connected to ${config.MONGODB.Name}:${url}`)
}
