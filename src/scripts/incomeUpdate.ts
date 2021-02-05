import {dbConnect} from "../infrastructure/mongo";
import {BillType, WITHDRAW_APPLY_STATUS} from "../infrastructure/utils/constants";
import withdrawApply from "@src/models/withdrawApply";
import UserModel from "@src/models/user";
import BillModel from "@src/models/bill";
import BigNumber from "bignumber.js";

async function updateIncome() {
  await dbConnect();

  // // 更新所有bill
  // const consumeBills = await BillModel.find({type: BillType.consume});
  //
  // // 插入新规则bill
  // for (const item of consumeBills) {
  //   console.log("========================")
  //   if (new BigNumber(item.amount).isGreaterThan(0)) {
  //     console.log(item.toJSON());
  //     const earnBill = {
  //       uuid: item.target!,
  //       type: BillType.earn,
  //       amount: new BigNumber(item.totalAmount ?? item.amount).multipliedBy(1- PLATFORM_COMMISSION_RATIO),
  //       commissionAmount: 0,
  //       totalAmount: item.totalAmount ?? item.amount,
  //       consumeType: item.consumeType,
  //       consumeId: item.consumeId,
  //       createdAt: item.createdAt,
  //       updatedAt: item.createdAt,
  //     };
  //     await BillModel.create(earnBill);
  //     item.amount = item.totalAmount ?? item.amount;
  //     item.totalAmount = item.totalAmount ?? item.amount;
  //     await item.save();
  //     console.log(earnBill)
  //   } else {
  //     console.log("amount less than 0 or equal 0")
  //   }
  // }

  // 取消所有订单
  await withdrawApply.updateMany({}, {$set: {status: WITHDRAW_APPLY_STATUS.CANCELED}});

  // update user income
  const users = await UserModel.find();
  for (const user of users) {
    const userEarnBills = await BillModel.find({type: BillType.earn, uuid: user.uuid});
    const earnAmount = userEarnBills.map(item => item.amount).reduce((pre, cur) => new BigNumber(pre).plus(cur), new BigNumber(0));
    const freezeWithdrawAmount = new BigNumber(0);
    const withdrawAmount = new BigNumber(0);
    const inviteAmount = new BigNumber(0);
    user.incomeAmount = earnAmount;
    user.freezeWithdrawAmount = freezeWithdrawAmount;
    user.withdrawAmount = withdrawAmount;
    user.inviteAmount = inviteAmount;
    user.chatPrice = user.chatPrice ?? 0
    await user.save();
    console.log(`${user.uuid} income ${earnAmount}`)
  }
}

updateIncome().then(() => {
  console.log("end")
})