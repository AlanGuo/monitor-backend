import {loadMediaProducer} from "@src/services/producer/mediaProducer";
import {loadUserSubPriceProducer} from "@src/services/producer/userSubPriceProducer";
import {loadMessageProducer} from "@src/services/producer/messageProducer";

export async function loadProducer() {
  await loadMediaProducer();
  await loadUserSubPriceProducer();
  await loadMessageProducer();
}