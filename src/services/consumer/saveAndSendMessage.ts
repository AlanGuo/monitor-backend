import config from "@src/infrastructure/utils/config";
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  DialogueStatus,
  JUSTFANS_EXCHANGE, MEDIA_TYPE,
  MESSAGE_ROUTING_KEY, NotificationType,
  RABBITMQ_EXCHANGE_TYPE, SAVE_MESSAGE_QUEUE, SOCKET_CHANNEL,
} from "@src/infrastructure/utils/constants";
import MessageModel from "@src/models/message"
import UserModel from "@src/models/user";
import {getMediaFileName, getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {Message, User} from "@src/interface";
import {getOnlineUser, redis} from "@src/infrastructure/redis";
import {mediaType} from "@src/infrastructure/utils";
import {getSocketIO} from "@src/infrastructure/socket";
import SocketIO from "socket.io";
import DialogueModel, {Dialogue} from "@src/models/dialogue";
import MediaModel from "@src/models/media";
import {notificationProducer} from "@src/services/producer/notificationProducer";


export async function loadSaveAndSendMessageConsumer() {
  const io = getSocketIO();

  const consumer = new Consumer(SAVE_MESSAGE_QUEUE, MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    const tmp = JSON.parse(msg);
    console.log('save and send message:', msg);
    const users = await getMessageUsers(tmp)
    if (users) {
      const dialogue = await createDialogue(tmp, users);
      if (users.to.chatPrice === 0 || dialogue!.talkExpireTime > Date.now()) {
        const message = await saveMessage(tmp);
        if (message) {
          await sendMessage({...tmp, _id: message._id, payment: message.price! <= 0}, io)
          await updateDialogue(tmp);
        }
      }
    }
  })
}

async function saveMessage(message: Message) {
  const media: string[] = message.media.map((item: any) => {
    return item.key ? getMediaFileName(item.type, item.key) : item.fileName
  });
  if (message.content.trim() !== "" || media.length > 0) {
    return await MessageModel.create({
      from: message.from,
      to: message.to,
      price: message.price || 0,
      content: message.content,
      media: media
    })
  }
}

async function sendMessage(message: Message, io: SocketIO.Server) {
  const toSid = await getOnlineUser(message.to);
  for (const media of message.media) {
    if (!media.ready) {
      // 媒体未完成转换
      const ext = media.key!.split(".")[1];
      const mediaInfo = mediaType(ext)
      const fileNameWithoutExt = media.key!.split(".")[0].replace(config.AWS_MEDIA_CONVERT[mediaInfo.sourceFolder], "");
      const data = await redis.get(config.AWS_MEDIA_CONVERT[mediaInfo.confKey] + fileNameWithoutExt);
      if (data) {
        const decodedData = JSON.parse(data);
        decodedData.subscribers.push(message.to);
        decodedData.free = message.price <= 0
        await redis.set(config.AWS_MEDIA_CONVERT[mediaInfo.confKey] + fileNameWithoutExt, JSON.stringify(decodedData));
      } else {
        // message.media.forEach(media => {
        media.ready = true;
        switch (media.type) {
          case MEDIA_TYPE.IMAGE:
            const tmpImageMedia = await MediaModel.findOne({fileName: getMediaFileName(media.type, media.key!)});
            console.log("sendMessage", media, tmpImageMedia);
            if (tmpImageMedia) {
              media.urls = getMediaUrl(MEDIA_TYPE.IMAGE, tmpImageMedia!.fileName, message.payment, tmpImageMedia!.size);
              media.size = tmpImageMedia!.size;
            }
            break;
          case MEDIA_TYPE.VIDEO:
            const tmpVideoMedia = await MediaModel.findOne({fileName: getMediaFileName(media.type, media.key!)});
            console.log("sendMessage", media, tmpVideoMedia);
            if (tmpVideoMedia) {
              media.urls = getMediaUrl(MEDIA_TYPE.VIDEO, tmpVideoMedia!.fileName, message.payment, tmpVideoMedia!.size);
              media.size = tmpVideoMedia!.size;
            }
        }
        // })
      }
    } else {
      media.ready = true;
      const tmpMedia = await MediaModel.findOne({fileName: getMediaFileName(media.type, media.key!)});
      media.urls = getMediaUrl(media.type, tmpMedia!.fileName, message.payment, tmpMedia!.size);
      media.size = tmpMedia!.size
    }
  }
  if (toSid) {
    io.sockets.connected[toSid]?.emit(SOCKET_CHANNEL.CHAT_MESSAGE, JSON.stringify(message))
    io.sockets.connected[toSid]?.emit(SOCKET_CHANNEL.NEW_MSG, JSON.stringify(message))
  } else {
    // await chatNotification(message);
  }
}

async function createDialogue(message: Message, users: { from: User, to: User }) {
  const sender = await DialogueModel.findOneAndUpdate(
    {from: message.from, to: message.to},
    {
      $setOnInsert: {
        from: message.from,
        to: message.to,
        timeline: 0,
        talkExpireTime: 0,
        show: true,
      }
    },
    {new: true, upsert: true}
  )

  await DialogueModel.findOneAndUpdate(
    {from: message.to, to: message.from},
    {
      $setOnInsert: {
        from: message.to,
        to: message.from,
        timeline: 0,
        talkExpireTime: 0,
        show: true
      }
    },
    {new: true, upsert: true}
  );
  return sender;
}

async function updateDialogue(message: Message) {
  await DialogueModel.updateOne({from: message.from, to: message.to}, {$set: {show: true}})
  await DialogueModel.updateOne({from: message.to, to: message.from}, {$set: {show: true, status: DialogueStatus.newMessage}})
}

async function getMessageUsers(message: Message) {
  const users = await UserModel.find({uuid: {$in: [message.from, message.to]}})
  const from = users.find(item => item.uuid === message.from)
  const to = users.find(item => item.uuid === message.to)
  if (from && to) {
    return {from, to}
  }
  throw "message sender or message receiver not exists"
}
