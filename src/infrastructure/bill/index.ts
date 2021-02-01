import {BillType, ConsumeType, PLATFORM_COMMISSION_RATIO} from "@src/infrastructure/utils/constants";
import {ClientSession, Types} from "mongoose";
import BillModel from "@src/models/bill";
import BigNumber from "bignumber.js";

export async function createBill(
  billData: {
    uuid: number,
    amount: BigNumber,
    type: BillType,
    target?: number,
    consumeType?: ConsumeType,
    consumeId?: Types.ObjectId,
    rechargeId?: string, createdAt?: Date
  },
  session: ClientSession
) {
  switch (billData.type) {
    case BillType.deposit:
      await BillModel.create([
        {
          uuid: billData.uuid,
          type: billData.type,
          rechargeId: billData.rechargeId,
          amount: billData.amount,
          commissionAmount: "0",
          totalAmount: new BigNumber(billData.amount).toFixed(2)
        }
        ], {session})
      break;
    case BillType.consume:
      const amount = new BigNumber(billData.amount).multipliedBy(new BigNumber(1 - PLATFORM_COMMISSION_RATIO));
      const commissionAmount = new BigNumber(billData.amount).multipliedBy(PLATFORM_COMMISSION_RATIO);
      await BillModel.create([
        // consume
        {
        uuid: billData.uuid,
        target: billData.target,
        type: BillType.consume,
        amount,
        commissionAmount,
        totalAmount: billData.amount,
        consumeType: billData.consumeType,
        consumeId: billData.consumeId
        },
        // earn
        {
          uuid: billData.target!,
          type: BillType.earn,
          amount,
          commissionAmount,
          totalAmount: billData.amount,
          consumeType: billData.consumeType,
          consumeId: billData.consumeId
        }
      ], {session});

      break
  }
}
