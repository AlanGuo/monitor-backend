import axios from "axios";
import config from "@src/infrastructure/utils/config";
import {SLACK_WEB_HOOK} from "@src/infrastructure/utils/constants";

export async function sendSlackWebHook(type: SLACK_WEB_HOOK, msg: string) {
  if (process.env.NODE_ENV === "production") {
    switch (type) {
      case SLACK_WEB_HOOK.KYC:
        await axios.post(config.SLACK_KYC_HOOK, {text: msg});
        break;
      case SLACK_WEB_HOOK.DEPOSIT:
        await axios.post(config.SLACK_DEPOSIT_HOOK, {text: msg});
        break;
      case SLACK_WEB_HOOK.SUB:
        await axios.post(config.SLACK_SUB_HOOK, {text: msg});
        break;
      case SLACK_WEB_HOOK.TIP:
        await axios.post(config.SLACK_TIP_HOOK, {text: msg});
        break;
      case SLACK_WEB_HOOK.UNLOCK:
        await axios.post(config.SLACK_UNLOCK_HOOK, {text: msg});
        break;
      case SLACK_WEB_HOOK.POST:
        await axios.post(config.SLACK_POST_HOOK, {text: msg});
        break
    }
  }
}
