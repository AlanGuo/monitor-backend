import SequenceModel from "../../models/sequence";
import {Sequence, USER_SEQUENCE_INIT} from "./constants";

export async function initSequence() {
  await SequenceModel.updateOne(
    {_id: Sequence.USER},
    {$setOnInsert: {value: USER_SEQUENCE_INIT}},
    {upsert: true, new: true})
}

export async function getUserSequence() {
  const _id = Sequence.USER;
  const tmp = await SequenceModel.findOneAndUpdate(
    {_id},
    {$inc: {value: 1}},
    {upsert: true, new: true});
  return tmp.value
}
