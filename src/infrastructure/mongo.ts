import config from "@src/infrastructure/utils/config";
import {connect} from "mongoose";

export async function dbConnect(test = false): Promise<void> {
  const url = test ? config.MONGODB.Connection_String_URI_Test : config.MONGODB.Connection_String_URI;
  if (config.MONGODB && url) {
    await connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoCreate: true
      });
    console.log(`connected to ${config.MONGODB.Name}:${url}`)
  }
}
