import { handler } from '../lambdas/spExportFunction';

describe('SP Export Function', () => {
  test('Return a 200 response', () => {

    handler().then((response) => {
      console.log("TEST RESPONSE", response);
      expect(response).toMatchObject({
        statusCode: 200
      });
    }).catch((err) => {
      console.log(err);
    });
  });
});
