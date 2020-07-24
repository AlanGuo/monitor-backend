import {businessDBConnect, currencyDBConnection} from "../src/infrastructure/db";
import OrderItemEntity from "../src/models/orderItemEntity";
import TbllogCoinEntity from "../src/models/tbllogCoinEntity";
import TbllogSendCoinEntity from "../src/models/tbllogSendCoinEntity";
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
  let newRecords: any[] = [];
  for(let i=0;i<100;i++) {
    const OrderItem = OrderItemEntity.createEntity(date + "_" + i);
    businessConnection.addModels([OrderItem]);
    records = records.concat(await OrderItem.findAll());
  }
  records.forEach(item => {
    const findOne = newRecords.find((newItem) => {
      return (newItem.create_time === item.create_time && newItem.action_id === item.action_id && newItem.uid === item.uid);
    })
    if(findOne) {
      findOne.coin_all += item.coin_all;
    } else {
      newRecords.push(item);
    }
  });
  newRecords = newRecords.sort((a:any, b:any) => {
    return a.create_time - b.create_time
  });
  // 统计库
  const statsConnection = currencyDBConnection("livestar_currency");

  for(let i=0; i<newRecords.length;i++) {
    const orderItem:any = newRecords[i].toJSON();
    const createTime = new Date(orderItem.create_time * 1000);
    const time: string = createTime.getUTCFullYear().toString() + num2String(createTime.getUTCMonth() + 1) + num2String(createTime.getUTCDate());
    if (createTime.getUTCDate() >= beginDate && orderItem.coin_all > 0) {
      // check playercoin
      // 根据每一条充值记录去tbllog_playercoin_xxx查对应的记录，如果都存在就说明账目没有问题，如果有缺失就说明有问题
      const PlayerCoin = TbllogPlayerCoinEntity.createEntity(time)
      statsConnection.addModels([PlayerCoin]);

      const playercoinResults = await PlayerCoin.findAll({
        where: {
          createtime: orderItem.create_time,
          actionid: orderItem.action_id,
          userid: orderItem.uid,
          flag: -1
        }
      });

      let playercoinSum = 0;
      playercoinResults.forEach(item => {
        playercoinSum += item.coin;
      });

      if (playercoinSum === orderItem.coin_all) {
        // COIN表数据核对正确
        console.info(colors.green("PLAYERCOIN [" + createTime.toUTCString()+"] " + ("business:"+orderItem.coin_all +", stats:"+ playercoinSum) + " 日志校验正确"));
      } else {
        console.error(colors.red("PLAYERCOIN [" + createTime.toUTCString()+"] " + ("business:"+orderItem.coin_all +", stats:"+ playercoinSum)+ " 日志校验异常"));
        console.error(colors.red(orderItem));
        playercoinResults.forEach(item => {
          console.error(colors.red(JSON.stringify(item.toJSON())));
        });
      }
    }
  }
}
check(process.argv[2], Number(process.argv[3]));