import {businessDBConnect, currencyDBConnection} from "../src/infrastructure/db";
import LogDeliverEntity from "../src/models/logDeliverEntity";
import TbllogCoinEntity from "../src/models/tbllogCoinEntity";
import TbllogSendCoinEntity from "../src/models/tbllogSendCoinEntity";
import TbllogPlayerCoinEntity from "../src/models/tbllogPlayerCoinEntity";
import colors from "colors";
import TblApplyMainEntity from "../src/models/tblApplyMainEntity";
import { Op } from "sequelize";

const num2String = function(num: number) {
  if(num< 10) {
    return "0" + num;
  } else {
    return num.toString();
  }
}

async function recover(date: string, beginDate: number) {
  console.info(colors.blue("----------------------------------------------------用户 充值--------------------------------------------------------------"));
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

    // check coin
    // 根据每一条充值记录去tbllog_coin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
    const Coin = TbllogCoinEntity.createEntity(time);
    statsConnection.addModels([Coin]);

    const coinResults = await Coin.findAll({
      where: {
        createtime: logDeliverItem.deliver_time
      }
    });

    // check sendcoin
    // 根据每一条充值记录去tbllog_sendcoin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
    const SendCoin = TbllogSendCoinEntity.createEntity(time);
    statsConnection.addModels([SendCoin]);

    const sendcoinItem = await SendCoin.findOne({
      where: {
        createtime: logDeliverItem.deliver_time
      }
    });

    // 创建playercoin
    const PlayerCoin = TbllogPlayerCoinEntity.createEntity(time);
    statsConnection.addModels([PlayerCoin]);
    // 充值所得
    await PlayerCoin.upsert({
      siteid: logDeliverItem.site_id,
      userid: logDeliverItem.user_id,
      coin_type: 1,
      coin_source: coinResults[0]?.coin_source || 1,
      actionid: 100001,
      coin: logDeliverItem.starcoin,
      flag: 1,
      level: coinResults[0]?.level,
      ip: logDeliverItem.ip,
      createtime: logDeliverItem.deliver_time,
      eventid: coinResults[0]?.eventid || sendcoinItem?.eventid,
    })

    if (logDeliverItem.starcoin_gift > 0) {
      // 充值赠送
      await PlayerCoin.upsert({
        siteid: logDeliverItem.site_id,
        userid: logDeliverItem.user_id,
        coin_type: 1,
        coin_source: coinResults[1]?.coin_source || 2,
        actionid: 100001,
        coin: logDeliverItem.starcoin_gift,
        flag: 1,
        level: coinResults[0]?.level,
        ip: logDeliverItem.ip,
        createtime: logDeliverItem.deliver_time,
        eventid: coinResults[1]?.eventid || sendcoinItem?.eventid || 'recover',
      })
    }

    // COIN表数据核对正确
    console.info(colors.green("PLAYERCOIN [" + deliverTime.toUTCString() + "] 日志恢复成功"));
  }


  console.info(colors.blue("----------------------------------------------------OSS 充值--------------------------------------------------------------"));
  // OSS业务库
  businessDBConnect("livestar_oss");
  const dateStart = new Date(date.slice(0, 4) + "-" + date.slice(-2) + " UTC")
  const dateEnd = new Date(new Date(dateStart).setMonth(dateStart.getMonth() + 1))
  const applyResults = await TblApplyMainEntity.findAll({
    where: {
      sendtime:{
        [Op.lt]: dateEnd.getTime()/1000,
        [Op.gte]: dateStart.getTime()/1000,
      }
    }
  })

  for(let i=0; i<applyResults.length;i++) {
    const applyItem:any = applyResults[i].toJSON();
    const sendTime = new Date(applyItem.sendtime * 1000);
    if (sendTime.getUTCDate() >= beginDate) {
      const time: string = sendTime.getUTCFullYear().toString() + num2String(sendTime.getUTCMonth() + 1) + num2String(sendTime.getUTCDate());
      // check coin
      // 根据每一条充值记录去tbllog_coin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
      const Coin = TbllogCoinEntity.createEntity(time)
      statsConnection.addModels([Coin]);

      const coinItem = await Coin.findOne({
        where: {
          createtime: applyItem.sendtime,
          actionid: 100006
        }
      });

      // 创建playercoin
      const PlayerCoin = TbllogPlayerCoinEntity.createEntity(time);
      statsConnection.addModels([PlayerCoin]);
      // 充值所得
      await PlayerCoin.upsert({
        siteid: coinItem?.siteid || 1,
        userid: applyItem.user_uid,
        coin_type: 1,
        coin_source: coinItem?.coin_source || 5,
        actionid: 100006,
        coin: applyItem.apply_quantity,
        flag: 1,
        level: coinItem?.level,
        // ip: applyItem.ip,
        createtime: applyItem.sendtime,
        eventid: coinItem?.eventid || "recover"
      })

      console.info(colors.green("PLAYERCOIN [" + sendTime.toUTCString() + "] 日志恢复成功"));
    }
  }
}

recover(process.argv[2], Number(process.argv[3]));
