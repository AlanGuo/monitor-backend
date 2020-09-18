import config from "@src/infrastructure/utils/config";
import {connect} from "mongoose";

export async function dbConnect(test = false): Promise<void> {
  const url = test ? config.MONGODB.Connection_String_URI_Test : config.MONGODB.Connection_String_URI;
  await connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
      autoCreate: true,
      readPreference: "primary",
      dbName: config.MONGODB.DB,
      replicaSet: config.MONGODB.ReplicaSet,
    });
  console.log('=')
  console.log(`connected to ${config.MONGODB.Name}:${url}`)
}
