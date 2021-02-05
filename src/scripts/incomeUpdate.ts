import {dbConnect} from "../infrastructure/mongo";
import BillModel from "../models/bill";
import {BillType} from "../infrastructure/utils/constants";
import BigNumber from "bignumber.js";

async function updateIncome() {
  await dbConnect();

  // 更新所有bill
  const consumeBills = await BillModel.find({type: BillType.consume});

  // 插入新规则bill
  for (const item of consumeBills) {
    if (new BigNumber(item.amount).isGreaterThan(0)) {
      console.log(item.toJSON())
    } else {
      console.log("amount less than 0 or equal 0")
    }
  }

  // 取消所有订单
}

updateIncome().then(()=>{console.log("end")})