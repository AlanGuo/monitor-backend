import {loadSaveAndSendMessageConsumer} from "@src/services/consumer/saveAndSendMessage";
import {loadSaveMediaConsumer} from "@src/services/consumer/saveMedia";
import {loadUpdateUserChatPriceConsumer} from "@src/services/consumer/updateUserChatPrice";
import {loadSaveNotificationConsume} from "@src/services/consumer/saveNotification";

export async function loadConsumer() {
  await loadSaveAndSendMessageConsumer()
  await loadSaveMediaConsumer();
  await loadUpdateUserChatPriceConsumer();
  await loadSaveNotificationConsume();
}