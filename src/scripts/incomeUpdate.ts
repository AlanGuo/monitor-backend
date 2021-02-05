import {dbConnect} from "../infrastructure/mongo";
import BillModel from "../models/bill";
import {BillType, PLATFORM_COMMISSION_RATIO} from "../infrastructure/utils/constants";
import BigNumber from "bignumber.js";

async function updateIncome() {
  await dbConnect();

  // 更新所有bill
  const consumeBills = await BillModel.find({type: BillType.consume});

  // 插入新规则bill
  for (const item of consumeBills) {
    console.log("========================")
    if (new BigNumber(item.amount).isGreaterThan(0)) {
      console.log(item.toJSON());
      const earnBill = {
        uuid: item.target!,
        type: BillType.earn,
        amount: new BigNumber(item.totalAmount).multipliedBy(1- PLATFORM_COMMISSION_RATIO),
        commissionAmount: 0,
        totalAmount: item.totalAmount || item.amount,
        consumeType: item.consumeType,
        consumeId: item.consumeId,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      };
      await BillModel.create(earnBill);
      item.amount = item.totalAmount || item.amount;
      await item.save();
      console.log(earnBill)
    } else {
      console.log("amount less than 0 or equal 0")
    }
  }

  // 取消所有订单
}

updateIncome().then(()=>{console.log("end")})