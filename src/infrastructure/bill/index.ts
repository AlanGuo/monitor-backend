import {BillType, ConsumeType, PLATFORM_COMMISSION_RATIO} from "@src/infrastructure/utils/constants";
import {ClientSession, Types} from "mongoose";
import BillModel from "@src/models/bill";

export async function createBill(
  billData: {
    uuid: number,
    amount: number,
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
          commissionAmount: 0,
          totalAmount: billData.amount
        }
        ], {session})
      break;
    case BillType.consume:
      await BillModel.create([{
        uuid: billData.uuid,
        target: billData.target,
        type: billData.type,
        amount: billData.amount * (1 - PLATFORM_COMMISSION_RATIO),
        commissionAmount: billData.amount * PLATFORM_COMMISSION_RATIO,
        totalAmount: billData.amount,
        consumeType: billData.consumeType,
        consumeId: billData.consumeId
      }], {session})
      break
  }
}
