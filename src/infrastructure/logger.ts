import log4js from "log4js";

const isDev = process.env.NODE_ENV === "dev";
const globalLevel = isDev ? "TRACE" : "INFO";

const logConfig = {
  pm2: true,
  pm2InstanceVar: "NEWONLYFANS_BACKEND",
  disableClustering: true,
  appenders: {
    commonFile: {
      type: "file", // 文件日志，默认保留5个备份
      filename: "logs/common.log",
      maxLogSize: 10485760, // 10Mb
    },
    common: { // 普通日志记录INFO和WARN级别
      type: "logLevelFilter",
      level: "INFO",
      maxLevel: "WARN",
      appender: "commonFile",
    },
    errorFile: {
      type: "file",
      filename: "logs/error.log",
    },
    error: {
      type: "logLevelFilter",
      level: "ERROR",
      appender: "errorFile",
    },
    debug: {
      type: "console",
    },
  },
  categories: {
    default: {
      appenders: ["debug", "common", "error"],
      level: globalLevel,
    },
  },
};

if (process.env.LOG_ENV !== "production") {
  // 非生产环境下，所有日志打印到console
  logConfig.categories = {
    default: {
      appenders: ["debug"],
      level: globalLevel,
    },
  };
}

log4js.configure(logConfig);
const logger = log4js.getLogger();

console.log = console.info = logger.info.bind(logger);
console.error = logger.error.bind(logger);
console.debug = logger.debug.bind(logger);
console.warn = logger.warn.bind(logger);
console.trace = logger.trace.bind(logger);

export { logger };
