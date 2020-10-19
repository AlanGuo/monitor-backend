import {loadSaveAndSendMessageConsumer} from "@src/services/consumer/saveAndSendMessage";
import {loadSaveMediaConsumer} from "@src/services/consumer/saveMedia";
import {loadUpdateUserSubPriceConsumer} from "@src/services/consumer/updateUserSubPrice";

export async function loadConsumer() {
  await loadSaveAndSendMessageConsumer()
  await loadSaveMediaConsumer();
  await loadUpdateUserSubPriceConsumer();
}