/**
 * @author Joe Scarano
 * @copyright Copyright 2022 by Entitech Solutions., USA. All Rights Reserved.
 * @date 2021-05-05
 * @description A client to access the Docuvera API.
 * @filename docuveraClient.ts
 */
 import LambdaLog from 'lambda-log';
 import { get as _get } from 'superagent';
 
 export async function getStudies(baseUrl: string, token: string): Promise<void> {
   LambdaLog.debug('http-utilities:rave-client:getStudies', {
     baseUrl,
     locationId: 'RbUry3g6SSG3AjjQRpMRTg',
     token,
   });
 
   await _get(`${baseUrl}/studies`.replace('//studies', '/studies')).set('Authorization', token);
 
   return Promise.resolve();
 }
 
 export default getStudies;
 