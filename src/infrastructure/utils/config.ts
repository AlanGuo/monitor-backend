import c from "config";
import {Config} from "@src/interface";

const config: c.IConfig & Config = c as c.IConfig & Config;

export = config