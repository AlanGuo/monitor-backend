import {loadMediaProducer} from "@src/services/producer/mediaProducer";
import {loadUserSubPriceProducer} from "@src/services/producer/userSubPriceProducer";
import {loadMessageProducer} from "@src/services/producer/messageProducer";
import {loadNotificationProducer} from "@src/services/producer/notificationProducer";

export async function loadProducer() {
  await loadMediaProducer();
  await loadUserSubPriceProducer();
  await loadMessageProducer();
  await loadNotificationProducer();
}