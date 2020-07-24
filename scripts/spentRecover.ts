import {businessDBConnect, currencyDBConnection} from "../src/infrastructure/db";
import OrderItemEntity from "../src/models/orderItemEntity";
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
  console.info(colors.blue("----------------------------------------------------用户 消费--------------------------------------------------------------"));
  // 业务库
  const businessConnection = businessDBConnect("livestar_user_extra_log");
  let records: any[] = [];

  for(let i=0;i<100;i++) {
    const OrderItem = OrderItemEntity.createEntity(date + "_" + i);
    businessConnection.addModels([OrderItem]);
    records = records.concat(await OrderItem.findAll());
  }
  records = records.sort((a:any, b:any) => {
    return a.create_time - b.create_time
  });
  // 统计库
  const statsConnection = currencyDBConnection("livestar_currency");

  for(let i=0; i<records.length;i++) {
    const orderItem:any = records[i].toJSON();
    const createTime = new Date(orderItem.create_time * 1000);
    const time: string = createTime.getUTCFullYear().toString() + num2String(createTime.getUTCMonth() + 1) + num2String(createTime.getUTCDate());
    if (createTime.getUTCDate() >= beginDate && orderItem.coin_all > 0) {
      // check playercoin
      // 根据每一条消费记录去tbllog_playercoin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
      const PlayerCoin = TbllogPlayerCoinEntity.createEntity(time)
      statsConnection.addModels([PlayerCoin]);
      
      // 移除对应的记录
      // await PlayerCoin.destroy({
      //   where: {
      //     createtime: orderItem.create_time,
      //     actionid: orderItem.action_id,
      //     userid: orderItem.uid,
      //     coin_source: 1,
      //     flag: -1
      //   }
      // });
      
      //五种类型
      if(orderItem.coin_pay) {
        const existItem = await PlayerCoin.findOne({
          where: {
            createtime: orderItem.create_time,
            actionid: orderItem.action_id,
            userid: orderItem.uid,
            coin_source: 1,
            flag: -1
          }
        });
        if(!existItem) {
        // 再一条条恢复
          await PlayerCoin.upsert({
            siteid: 1,
            userid: orderItem.uid,
            coin_type: 1,
            coin_source: 1,
            actionid: orderItem.action_id,
            coin: orderItem.coin_pay,
            flag: -1,
            // level: orderItem?.level,
            // ip: applyItem.ip,
            createtime: orderItem.create_time,
            eventid: "recover"
          })
          console.info(colors.green("PLAYERCOIN[COIN_SOURCE:1] [" + createTime.toUTCString() + "] 日志恢复成功"));
        }
      }
      if(orderItem.coin_bns) {
        const existItem = await PlayerCoin.findOne({
          where: {
            createtime: orderItem.create_time,
            actionid: orderItem.action_id,
            userid: orderItem.uid,
            coin_source: 2,
            flag: -1
          }
        });
        if(!existItem) {
          // 再一条条恢复
          await PlayerCoin.upsert({
            siteid: 1,
            userid: orderItem.uid,
            coin_type: 1,
            coin_source: 2,
            actionid: orderItem.action_id,
            coin: orderItem.coin_bns,
            flag: -1,
            // level: orderItem?.level,
            // ip: applyItem.ip,
            createtime: orderItem.create_time,
            eventid: "recover"
          })
          console.info(colors.green("PLAYERCOIN[COIN_SOURCE:2] [" + createTime.toUTCString() + "] 日志恢复成功"));
        }
      }
      if(orderItem.coin_lck) {
        const existItem = await PlayerCoin.findOne({
          where: {
            createtime: orderItem.create_time,
            actionid: orderItem.action_id,
            userid: orderItem.uid,
            coin_source: 3,
            flag: -1
          }
        });
        if(!existItem) {
          // 再一条条恢复
          await PlayerCoin.upsert({
            siteid: 1,
            userid: orderItem.uid,
            coin_type: 1,
            coin_source: 3,
            actionid: orderItem.action_id,
            coin: orderItem.coin_lck,
            flag: -1,
            // level: orderItem?.level,
            // ip: applyItem.ip,
            createtime: orderItem.create_time,
            eventid: "recover"
          })
          console.info(colors.green("PLAYERCOIN[COIN_SOURCE:3] [" + createTime.toUTCString() + "] 日志恢复成功"));
        }
      }
      if(orderItem.coin_exc) {
        const existItem = await PlayerCoin.findOne({
          where: {
            createtime: orderItem.create_time,
            actionid: orderItem.action_id,
            userid: orderItem.uid,
            coin_source: 4,
            flag: -1
          }
        });
        if(!existItem) {
          // 再一条条恢复
          await PlayerCoin.upsert({
            siteid: 1,
            userid: orderItem.uid,
            coin_type: 1,
            coin_source: 4,
            actionid: orderItem.action_id,
            coin: orderItem.coin_exc,
            flag: -1,
            // level: orderItem?.level,
            // ip: applyItem.ip,
            createtime: orderItem.create_time,
            eventid: "recover"
          })
          console.info(colors.green("PLAYERCOIN[COIN_SOURCE:4] [" + createTime.toUTCString() + "] 日志恢复成功"));
        }
      }
      if(orderItem.coin_rfu) {
        const existItem = await PlayerCoin.findOne({
          where: {
            createtime: orderItem.create_time,
            actionid: orderItem.action_id,
            userid: orderItem.uid,
            coin_source: 5,
            flag: -1
          }
        });

        if(!existItem) {
          // 再一条条恢复
          await PlayerCoin.upsert({
            siteid: 1,
            userid: orderItem.uid,
            coin_type: 1,
            coin_source: 5,
            actionid: orderItem.action_id,
            coin: orderItem.coin_rfu,
            flag: -1,
            // level: orderItem?.level,
            // ip: applyItem.ip,
            createtime: orderItem.create_time,
            eventid: "recover"
          })

          console.info(colors.green("PLAYERCOIN[COIN_SOURCE:5] [" + createTime.toUTCString() + "] 日志恢复成功"));
        }
      }
    }
  }
}
check(process.argv[2], Number(process.argv[3]));