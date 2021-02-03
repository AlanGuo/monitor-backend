import {
  BillType,
  ConsumeType,
  LEVEL1_INVITE_COMMISSION_RATIO, LEVEL2_INVITE_COMMISSION_RATIO,
  PLATFORM_COMMISSION_RATIO
} from "@src/infrastructure/utils/constants";
import {ClientSession, Types} from "mongoose";
import BillModel from "@src/models/bill";
import UserModel, {IUser} from "@src/models/user";
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
  if (new BigNumber(billData.amount).isLessThanOrEqualTo(0)) {
    return
  }
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
      const bills = []
      const earnAmount = new BigNumber(billData.amount).multipliedBy(1 - PLATFORM_COMMISSION_RATIO);
      let commissionAmount = new BigNumber(billData.amount).multipliedBy(PLATFORM_COMMISSION_RATIO);
      let level1Amount = new BigNumber(billData.amount).multipliedBy(LEVEL1_INVITE_COMMISSION_RATIO);
      const level2Amount = new BigNumber(billData.amount).multipliedBy(LEVEL2_INVITE_COMMISSION_RATIO);
      // 判断邀请关系计算分成
      // 没有 有一级 有二级
      const {level, user: targetUser, inviteUser, preInviteUser} = await checkInvite(billData.target!, session);
      switch (level) {
        case 0:
          commissionAmount = commissionAmount.multipliedBy(PLATFORM_COMMISSION_RATIO);
          break;
        case 1:
          level1Amount = level1Amount.plus(level2Amount);
          commissionAmount = commissionAmount.minus(level1Amount);
          // invite bill
          bills.push({
            uuid: inviteUser!.uuid,
            from: targetUser!.uuid,
            type: BillType.invite,
            amount: level1Amount,
            commissionAmount: 0,
            totalAmount: billData.amount,
            consumeType: billData.consumeType,
            consumeId: billData.consumeId
          });
          // update invite
          break;
        case 2:
          commissionAmount = commissionAmount.minus(level1Amount).minus(level2Amount);
          // invite bill
          bills.push({
            uuid: inviteUser!.uuid,
            from: targetUser!.uuid,
            type: BillType.invite,
            amount: level1Amount,
            commissionAmount: 0,
            totalAmount: billData.amount,
            consumeType: billData.consumeType,
            consumeId: billData.consumeId
          });
          // invite bill
          bills.push({
            uuid: preInviteUser!.uuid,
            from: targetUser!.uuid,
            type: BillType.invite,
            amount: level2Amount,
            commissionAmount: 0,
            totalAmount: billData.amount,
            consumeType: billData.consumeType,
            consumeId: billData.consumeId
          });
          break;
      }
      // consume
      bills.push({
        uuid: billData.uuid,
        target: billData.target,
        type: BillType.consume,
        amount: billData.amount,
        commissionAmount,
        totalAmount: billData.amount,
        consumeType: billData.consumeType,
        consumeId: billData.consumeId
      });
      // earn
      bills.push({
        uuid: billData.target!,
        type: BillType.earn,
        amount: earnAmount,
        commissionAmount: 0,
        totalAmount: billData.amount,
        consumeType: billData.consumeType,
        consumeId: billData.consumeId
      });
      await BillModel.create(bills, {session});

      break
  }
}


async function checkInvite(uuid: number, session: ClientSession): Promise<{ level: 0 | 1 | 2, user?: IUser, inviteUser?: IUser, preInviteUser?: IUser }> {
  const rep: { level: 0 | 1 | 2, user?: IUser, inviteUser?: IUser, preInviteUser?: IUser } = {
    level: 0,
    user: undefined,
    inviteUser: undefined,
    preInviteUser: undefined
  };
  const fields = {invite: 1, uuid: 1};
  const user = await UserModel.findOne({uuid: uuid}, fields, {session});
  if (user && user.invite && user.invite !== 0) {
    rep.user = user;
    const inviteUser = await UserModel.findOne({uuid: user.invite}, fields, {session});
    if (inviteUser && inviteUser.invite && inviteUser.invite !== 0) {
      rep.inviteUser = inviteUser;
      const preInviteUser = await UserModel.findOne({uuid: inviteUser.invite}, fields, {session});
      if (preInviteUser) {
        rep.preInviteUser = preInviteUser;
        rep.level = 2
      } else {
        rep.level = 1;
      }
    }
  }
  return rep;
}
