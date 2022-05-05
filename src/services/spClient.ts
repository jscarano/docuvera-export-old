/**
 * @author Joe Scarano
 * @copyright Copyright 2022 by Entitech Solutions., USA. All Rights Reserved.
 * @date 2021-05-05
 * @description A client to access SharePoint.
 * @filename spClient.ts
 */

import { get as _get, post as _post } from 'superagent';
import * as msal from "@azure/msal-node";
import { AuthenticationResult, ClientCredentialRequest } from '@azure/msal-node';
import { ISharePointConfig } from 'src/interfaces/ISharePointConffig';

export class SPClient {
    private _spConfig: ISharePointConfig;

    constructor(spConfig: ISharePointConfig) {
        this._spConfig = spConfig;
    }

    public uploadFile(filename: string, fileBuffer: ArrayBuffer): Promise<any> {
        //console.log("uploadFile", filename, fileBuffer);
        return new Promise<any>((resolve, reject) => {
            const headers = {} as Record<string, string>;
            // Construct the Endpoint  
            let libUrl = `/${this._spConfig.libraryTitle}`;
            if (this._spConfig.folderPath) {
                libUrl = `${this._spConfig.webUrl}/${this._spConfig.libraryTitle}/${this._spConfig.folderPath}`;
            }
            const url = `${this._spConfig.webUrl}/_api/Web/GetFolderByServerRelativeUrl('${libUrl}')/Files/add(overwrite=true, url='${filename}')`;
            //console.log("SP URL", url);
            this.getAuthToken().then((authResp) => {
                //console.log("uploadFile auth", authResp);                
                if (authResp) {
                    headers.Authorization = `Bearer ${authResp.accessToken}`;              
                    headers.Accept = "application/json";
                    _post(`${this._spConfig.webUrl}/_api/contextinfo`).set(headers).accept("application/json").then((contextResp: any) => {
                        console.log("uploadFile context", contextResp);
                        headers["X-RequestDigest"] = contextResp.data.FormDigestValue;    
                        _post(url).set(headers).send(fileBuffer).then((uploadResp: any) => {
                            console.log("uploadFile upload", uploadResp);
                            resolve(uploadResp);
                        }).catch((error: any) => {
                            reject(error);
                        });
                    });
                }
            }).catch((err: any) => {
                reject(err);
            });
        });
    }

    private getAuthToken(): Promise<AuthenticationResult | null> {
        return new Promise<AuthenticationResult | null>((resolve, reject) => {
            const clientConfig = {
                auth: {
                    clientId: this._spConfig.clientId,
                    clientSecret: this._spConfig.clientSecret,
                    authority: `https://login.microsoftonline.com/${this._spConfig.tenantId}`
                }
            };
            // Create msal application object
            const cca = new msal.ConfidentialClientApplication(clientConfig);

            // With client credentials flows permissions need to be granted in the portal by a tenant administrator.
            // The scope is always in the format "<resource>/.default"
            const clientCredentialRequest: ClientCredentialRequest = {
                scopes: [`${this._spConfig.webUrl}/.default`], // replace with your resource
            };

            cca.acquireTokenByClientCredential(clientCredentialRequest).then((response: AuthenticationResult | null) => {
                resolve(response);
            }).catch((error) => {
                reject(JSON.stringify(error));
            });
        });
    }
}


