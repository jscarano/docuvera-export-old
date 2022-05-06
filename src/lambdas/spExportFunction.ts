import LambdaLog from 'lambda-log';
import { ISharePointConfig } from '../interfaces/ISharePointConfig';
import { SPClient } from '../services/spClient';
import { Utility } from '../services/utility';
import { resolve } from 'dns';

export const handler = (): Promise<any> => {
  return new Promise<any>((resolve, reject) => {
    LambdaLog.options.debug = true; //JSON.parse(process.env.ENABLE_DEBUG ?? "");

    try {
      const spConfig: ISharePointConfig = {
        clientId: "ab55a62b-7ea2-4b2f-84a0-6ef86d34542e",
        tenantId: "605df097-c469-4a6c-b88d-1ea04c982ca9",
        webUrl: "https://joetech.sharepoint.com",
        libraryTitle: "Testing Documents",
        certificateThumbprint: "2BBB60F414E8988D2FF558A14CDD7249EA9676A8"
      };
  
      const spClient = new SPClient(spConfig);
      const testing = {
        one: "this is a string property",
        two: 2,
        three: false
      };
      let fileBuffer = Utility.str2ab(JSON.stringify(testing));
  
      spClient.uploadFile("testing.json", testing).then((resp) => {
        LambdaLog.debug('SP Token', {
          keys: "",
          locationId: 'd2wWwPyuTIuoed7P7VTYiw',
          response: resp,
        });
  
        resolve({
          statusCode: 200
        });
      }).catch((err: any) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};
