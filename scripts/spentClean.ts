import {businessDBConnect, currencyDBConnection} from "../src/infrastructure/db";
import LogDeliverEntity from "../src/models/logDeliverEntity";
import TbllogPlayerCoinEntity from "../src/models/tbllogPlayerCoinEntity";
import colors, { white } from "colors";
import { Op } from "sequelize";

const num2String = function(num: number) {
  if(num< 10) {
    return "0" + num;
  } else {
    return num.toString();
  }
}

async function clean(date: string) {
  // 统计库
  const statsConnection = currencyDBConnection("livestar_currency");
  // 创建playercoin
  const PlayerCoin = TbllogPlayerCoinEntity.createEntity(date);
  statsConnection.addModels([PlayerCoin]);
  let totalDeleted = 0, count = 0;
  let reloadFlag = true;
  let results: any = [];
  do {
      if (reloadFlag) {
        results = await PlayerCoin.findAll();
      }
      const playerCoinItem = results[count];
      const sameOnes = await PlayerCoin.findAll({
        where:{
          siteid: playerCoinItem.siteid,
          userid: playerCoinItem.userid,
          coin_type: playerCoinItem.coin_type,
          coin_source: playerCoinItem.coin_source,
          actionid: playerCoinItem.actionid,
          coin: playerCoinItem.coin,
          flag: playerCoinItem.flag,
          ip: playerCoinItem.ip,
          level: playerCoinItem.level,
          createtime: playerCoinItem.createtime,
          eventid: playerCoinItem.eventid
        }
      })
      if (sameOnes.length > 1) {
        console.info(colors.blue("PLAYERCOIN Scanned " + count + " Record, " + sameOnes.length + " duplicate founded"));
        //删除完全一样的，仅留下一个
        for(let j=0;j<sameOnes.length-1;j++){
          await sameOnes[j].destroy();
          totalDeleted++;
        }
        reloadFlag = true;
        console.info(colors.green("PLAYERCOIN " + count + " Record, " + (sameOnes.length -1) + " duplicate deleted"));
        count++;
      } else {
        console.info(colors.blue("PLAYERCOIN Scanned "+ count + " Record, no duplicated"));
        // 没有重复数据，下一个
        count++;
        reloadFlag = false;
      }
  } while(count < results.length);
  console.info(colors.green("PLAYERCOIN CLEANED, " + totalDeleted.toString() + " DELETED"));
}

clean(process.argv[2]);