import LambdaLog from 'lambda-log';
import * as Handlebars from 'handlebars';

export const handler = async (event: any): Promise<any> => {

  //console.log("test", process.env.ENABLE_DEBUG);
  LambdaLog.options.debug = true; //JSON.parse(process.env.ENABLE_DEBUG ?? "");

  const fs = require('fs');

  try {
    const template = fs.readFileSync('/templates/FIHR.template.json', 'utf8');
      const hTemplate = Handlebars.compile(template);
      const result = hTemplate(event);
      console.log(result);
  
      LambdaLog.debug('Convert Docuvera Document.', {
        keys: event.logKeys,
        locationId: 'd2wWwPyuTIuoed7P7VTYiw',
        response: result,
      });
  
      return {
        statusCode: 200
      };

  } catch (err) {
    Promise.reject(err);
  }
};
