// @ts-ignore
import config from "config";
import {connect} from "mongoose";

export async function dbConnect() {
  if (config.MONGODB && config.MONGODB.Connection_String_URI) {
    await connect(config.MONGODB.Connection_String_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true
      });
    console.log(`connected to ${config.MONGODB.Name}:${config.MONGODB.Connection_String_URI}`)
  }
}
