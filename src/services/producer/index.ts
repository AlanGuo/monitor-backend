import {loadMediaProducer} from "@src/services/producer/mediaProducer";
import {loadUserSubPriceProducer} from "@src/services/producer/userSubPriceProducer";

export async function loadProducer() {
  await loadMediaProducer();
  await loadUserSubPriceProducer();
}