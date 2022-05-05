import { Notes } from '../types/notesTable';
import { handler } from '../lambdas/convertFunction';

const event = {
  one: "",
  two: ""
};

describe('Convert Function', () => {
  test('Return a 200 response', () => {
    handler(event).then((response) => {
      expect(response).toMatchObject({
        statusCode: 200
      });  
    });
  });
});
