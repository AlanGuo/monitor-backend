import {businessDBConnect, currencyDBConnection} from "../src/infrastructure/db";
import LogDeliverEntity from "../src/models/logDeliverEntity";
import TbllogCoinEntity from "../src/models/tbllogCoinEntity";
import TbllogSendCoinEntity from "../src/models/tbllogSendCoinEntity";
import TblApplyMainEntity from "../src/models/tblApplyMainEntity";
import colors from "colors";
import TbllogPlayerCoinEntity from "../src/models/tbllogPlayerCoinEntity";
import { Op } from "sequelize";

const num2String = function(num: number) {
  if(num< 10) {
    return "0" + num;
  } else {
    return num.toString();
  }
}

async function check(date: string, beginDate: number) {
  console.info(colors.blue("----------------------------------------------------用户 充值--------------------------------------------------------------"));
  // 业务库
  const businessConnection = businessDBConnect("livestar_store_log");
  const LogDeliver = LogDeliverEntity.createEntity(date);
  businessConnection.addModels([LogDeliver]);
  // 统计库
  const statsConnection = currencyDBConnection("livestar_currency");

  const records = await LogDeliver.findAll();
  let businessStarCoinTotal = 0;
  for(let i=0; i<records.length;i++) {
    const logDeliverItem:any = records[i].toJSON();
    businessStarCoinTotal = logDeliverItem.starcoin_total;
    let nextLogDeliverItem:any = records[i+1]?.toJSON();
    while (nextLogDeliverItem && logDeliverItem.deliver_time === nextLogDeliverItem.deliver_time) {
      businessStarCoinTotal += nextLogDeliverItem.starcoin_total;
      nextLogDeliverItem = records[(++i)+1]?.toJSON();
    }
    const deliverTime = new Date(logDeliverItem.deliver_time * 1000);
    const time: string = deliverTime.getUTCFullYear().toString() + num2String(deliverTime.getUTCMonth() + 1) + num2String(deliverTime.getUTCDate());

    // // check coin
    // // 根据每一条充值记录去tbllog_coin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
    // const Coin = TbllogCoinEntity.createEntity(time)
    // statsConnection.addModels([Coin]);
    //
    // const coinResults = await Coin.findAll({
    //   where: {
    //     createtime: logDeliverItem.deliver_time,
    //     actionid: 100001
    //   }
    // });
    //
    // let coinSum = 0;
    // coinResults.forEach(item => {
    //   coinSum += item.coin;
    // });
    //
    // if (coinSum === logDeliverItem.starcoin_total) {
    //   // COIN表数据核对正确
    //   console.info(colors.green("COIN [" + deliverTime.toUTCString()+"] " + ("business:"+logDeliverItem.starcoin_total +", stats:"+ coinSum) + " 日志校验正确"));
    // } else {
    //   console.error(colors.red("COIN [" + deliverTime.toUTCString()+"] " + ("business:"+logDeliverItem.starcoin_total +", stats:"+ coinSum)+ " 日志校验异常"));
    //   console.error(colors.red(logDeliverItem));
    //   coinResults.forEach(item => {
    //     console.error(colors.red(JSON.stringify(item.toJSON())));
    //   });
    // }

    // check playercoin
    // 根据每一条充值记录去tbllog_playercoin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
    const PlayerCoin = TbllogPlayerCoinEntity.createEntity(time)
    statsConnection.addModels([PlayerCoin]);

    const playercoinResults = await PlayerCoin.findAll({
      where: {
        createtime: logDeliverItem.deliver_time,
        actionid: 100001
      }
    });

    let playercoinSum = 0;
    playercoinResults.forEach(item => {
      playercoinSum += item.coin;
    });

    if (playercoinSum === businessStarCoinTotal) {
      // COIN表数据核对正确
      console.info(colors.green("PLAYERCOIN [" + deliverTime.toUTCString()+"] " + ("business:"+logDeliverItem.starcoin_total +", stats:"+ playercoinSum) + " 日志校验正确"));
    } else {
      console.error(colors.red("PLAYERCOIN [" + deliverTime.toUTCString()+"] " + ("business:"+logDeliverItem.starcoin_total +", stats:"+ playercoinSum)+ " 日志校验异常"));
      console.error(colors.red(logDeliverItem));
      playercoinResults.forEach(item => {
        console.error(colors.red(JSON.stringify(item.toJSON())));
      });
    }

    // // check sendcoin
    // // 根据每一条充值记录去tbllog_sendcoin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
    // const SendCoin = TbllogSendCoinEntity.createEntity(time)
    // statsConnection.addModels([SendCoin]);
    //
    // const sendcoinItem = await SendCoin.findOne({
    //   where: {
    //     createtime: logDeliverItem.deliver_time
    //   }
    // });
    //
    // const sendcoinTotal = sendcoinItem?.totalcoin || 0;
    //
    // if (sendcoinTotal === logDeliverItem.starcoin_total) {
    //   // COIN表数据核对正确
    //   console.info(colors.green("SENDCOIN [" + deliverTime.toUTCString()+"] " + ("business:"+logDeliverItem.starcoin_total +", stats:"+ sendcoinTotal) + " 日志校验正确"));
    // } else {
    //   console.error(colors.red("SENDCOIN [" + deliverTime.toUTCString()+"] " + ("business:"+logDeliverItem.starcoin_total +", stats:"+ sendcoinTotal)+ " 日志校验异常"));
    //   console.error(colors.red(logDeliverItem));
    //   if (sendcoinItem) {
    //     console.error(colors.red(JSON.stringify(sendcoinItem?.toJSON())));
    //   }
    // }
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

      const coinResults = await Coin.findAll({
        where: {
          createtime: applyItem.sendtime,
          actionid: 100006
        }
      });

      let coinSum = 0;
      coinResults.forEach(item => {
        coinSum += item.coin;
      });

      if (coinSum === applyItem.apply_quantity) {
        // COIN表数据核对正确
        console.info(colors.green("COIN [" + sendTime.toUTCString()+"] " + ("oss:"+applyItem.apply_quantity +", stats:"+ coinSum) + " 日志校验正确"));
      } else {
        console.error(colors.red("COIN [" + sendTime.toUTCString()+"] " + ("oss:"+applyItem.apply_quantity +", stats:"+ coinSum)+ " 日志校验异常"));
        console.error(colors.red(applyItem));
        coinResults.forEach(item => {
          console.error(colors.red(JSON.stringify(item.toJSON())));
        });
      }
    }
  }
}
check(process.argv[2], Number(process.argv[3]));
