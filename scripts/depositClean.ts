import {businessDBConnect, currencyDBConnection} from "../src/infrastructure/db";
import LogDeliverEntity from "../src/models/logDeliverEntity";
import TbllogPlayerCoinEntity from "../src/models/tbllogPlayerCoinEntity";
import colors from "colors";
import { Op } from "sequelize";

const num2String = function(num: number) {
  if(num< 10) {
    return "0" + num;
  } else {
    return num.toString();
  }
}

async function clean(date: string) {
  // 业务库
  const businessConnection = businessDBConnect("livestar_store_log");
  const LogDeliver = LogDeliverEntity.createEntity(date);
  businessConnection.addModels([LogDeliver]);
  // 统计库
  const statsConnection = currencyDBConnection("livestar_currency");

  const records = await LogDeliver.findAll();
  for(let i=0; i<records.length;i++) {
    const logDeliverItem:any = records[i].toJSON();
    const deliverTime = new Date(logDeliverItem.deliver_time * 1000);
    const time: string = deliverTime.getUTCFullYear().toString() + num2String(deliverTime.getUTCMonth() + 1) + num2String(deliverTime.getUTCDate());

    // 创建playercoin
    const PlayerCoin = TbllogPlayerCoinEntity.createEntity(time);
    statsConnection.addModels([PlayerCoin]);
    await PlayerCoin.destroy({
      where: {
        [Op.or]: [{actionid: 100001}, {actionid: 100006}, {createtime: {$gte: records[0].deliver_time}}]
      }
    })
    // COIN表数据核对正确
    console.info(colors.green("PLAYERCOIN [" + deliverTime.toUTCString() + "] 日志清除成功"));
  }
}

clean(process.argv[2]);
