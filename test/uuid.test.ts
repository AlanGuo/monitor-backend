import {prepareUploadMedia} from "../src/infrastructure/amazon/s3";

describe("rabbitmq", () => {

  test("publish", async () => {
    await prepareUploadMedia('abc.png')
    await prepareUploadMedia('abc.png')
    await prepareUploadMedia('abc.png')

  },)
});

