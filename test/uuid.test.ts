import uuid from 'node-uuid';
import base64 from 'urlsafe-base64'
import {OAUTH} from "../src/infrastructure/utils/constants";
import {findOrCreateUser} from "../src/infrastructure/oauth_login";
import {dbConnect} from "../src/infrastructure/mongo";
import UserModel from "../src/models/user";
import {random} from "colors";


describe("uuid-test", () => {

  beforeAll(async ()=>{
    await dbConnect(true);
  });

  afterAll(async () => {
    // await UserModel.collection.drop();
  });

  test('findAndUpdateUser', async () => {
    await Promise.all(
      [...new Array(10).keys()].map(async item => {
        await findOrCreateUser(OAUTH.GOOGLE, {id: String(Math.random())});
        // console.log(user)
      })
    ).catch(err => {
      console.log(err)
    })

  }, 1000000)
});

