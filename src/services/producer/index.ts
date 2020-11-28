import {loadMediaProducer} from "@src/services/producer/mediaProducer";
import {loadUserChatPriceProducer} from "@src/services/producer/userChatPriceProducer";
import {loadMessageProducer} from "@src/services/producer/messageProducer";
import {loadNotificationProducer} from "@src/services/producer/notificationProducer";

export async function loadProducer() {
  await loadMediaProducer();
  await loadUserChatPriceProducer();
  await loadMessageProducer();
  await loadNotificationProducer();
}