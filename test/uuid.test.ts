import uuid from 'node-uuid';
import base64 from 'urlsafe-base64'


describe("uuid-test", () => {

  test('new uuid', ()=> {
    const uid = uuid.v4();
    console.log(uid, uuid.v4())
    console.log(base64.encode(Buffer.from(uid)))
  })
});

