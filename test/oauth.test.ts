import {OAUTH} from "../src/infrastructure/utils/constants";
import {bindUser, findOrCreateUser} from "../src/infrastructure/oauth_login";
import {dbConnect} from "../src/infrastructure/mongo";
import UserModel from "../src/models/user";
import {initSequence} from "../src/infrastructure/utils/sequence";


describe("uuid-test", () => {

  beforeAll(async () => {
    await dbConnect(true);
    await initSequence();
  });

  afterAll(async () => {
    await UserModel.collection.drop();
  });

  test("findAndUpdateUser", async () => {

    const list = [...new Array(1000).keys()];
    await Promise.all(
      list.map(async item => {
        const id = String(Math.random());
        await findOrCreateUser(OAUTH.GOOGLE, {id});
      })
    );
    const count = await UserModel.countDocuments();
    expect(count).toBe(1000)
  }, 1000000);

  test("bindUser", async () => {
    const uuid = Math.floor(Math.random() * 100 );
    const profile = {id: String(Math.random())};
    await UserModel.create({uuid});
    await bindUser(OAUTH.GOOGLE, profile, uuid);
    const user = await UserModel.findOne({uuid});
    expect(user!.google).toBe(profile.id);

    try {
      await bindUser(OAUTH.GOOGLE, profile, uuid+1);
    } catch (e) {
      expect(e.message).toBe("google account has been used")
    }
  }, 1000000)
});

