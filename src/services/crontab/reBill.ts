import {getTodayInterval} from "@src/infrastructure/utils/time";
import SubscriberModel from "@src/models/subscriber"

export async function reBill() {
  // 过期时间段
  const {startTime, endTime} = getTodayInterval();

  const subs = await SubscriberModel.find({expireAt: {$gte: startTime, $lte: endTime}});

  subs.forEach(item => {
    if (item.reBill) {
      // 付费 加时 通知
    } else {
      // 通知
    }
  })
  // 再付费为开启 并且已过期 进行再付费 并通知 (支付成功或失败)
  // 已过期 进行通知

}