import uuid from 'node-uuid';
import {OAUTH} from "../src/infrastructure/utils/constants";
import {findOrCreateUser} from "../src/infrastructure/oauth_login";
import {dbConnect} from "../src/infrastructure/mongo";
import UserModel from "../src/models/user";
import {initSequence} from "../src/infrastructure/utils/sequence";


describe("uuid-test", () => {

  beforeAll(async () => {
    await dbConnect(true);
    await initSequence();
  });

  afterAll(async () => {
    // await UserModel.collection.drop();
  });

  test('findAndUpdateUser', async () => {

    const list = [...new Array(1000).keys()];
    await Promise.all(
      list.map(async item => {
        const id = String(Math.random());
        await findOrCreateUser(OAUTH.GOOGLE, {id});
      })
    )

  }, 1000000)
});

