// @ts-ignore
import config from "config";
import {connect} from "mongoose";

export async function dbConnect(test: boolean = false) {
  const url = test ? config.MONGODB.Connection_String_URI_Test : config.MONGODB.Connection_String_URI;
  if (config.MONGODB && url) {
    await connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true
      });
    console.log(`connected to ${config.MONGODB.Name}:${url}`)
  }
}
