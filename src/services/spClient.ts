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
import { ISharePointConfig } from 'src/interfaces/ISharePointConfig';

export class SPClient {
    private _spConfig: ISharePointConfig;

    constructor(spConfig: ISharePointConfig) {
        this._spConfig = spConfig;
    }

    public uploadFile(filename: string, fileBuffer: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const headers = {} as Record<string, string>;
            // Construct the Endpoint  
            let libUrl = `/${this._spConfig.libraryTitle}`;
            if (this._spConfig.folderPath) {
                libUrl = `${this._spConfig.webUrl}/${this._spConfig.libraryTitle}/${this._spConfig.folderPath}`;
            }
            const url = `${this._spConfig.webUrl}/_api/Web/GetFolderByServerRelativeUrl('${libUrl}')/Files/add(overwrite=true, url='${filename}')`;

            this.getAuthToken().then((authResp) => {
                //console.log("uploadFile auth", authResp);
                if (authResp) {
                    headers.Authorization = `Bearer ${authResp.accessToken}`;
                    headers.Accept = "application/json";
                    _post(url).set(headers).send(fileBuffer).then((uploadResp: any) => {
                        //console.log("uploadFile upload", uploadResp);
                        resolve(uploadResp);
                    }).catch((error: any) => {
                        reject(error);
                    });
                }
            }).catch((err: any) => {
                reject(err);
            });
        });
    }

    private getAuthToken(): Promise<AuthenticationResult | null> {
        return new Promise<AuthenticationResult | null>((resolve, reject) => {
            const fs = require('fs');
            const privateKeySource = fs.readFileSync('./src/certs/scarano-sample.pem');
            const crypto = require('crypto');
            const privateKeyObject = crypto.createPrivateKey({
                key: privateKeySource,
                passphrase: "password", // enter your certificate passphrase here
                format: 'pem'
            });

            const privateKey = privateKeyObject.export({
                format: 'pem',
                type: 'pkcs1'
            });

            const config: msal.Configuration = {
                auth: {
                    clientId: this._spConfig.clientId,
                    authority: `https://login.microsoftonline.com/${this._spConfig.tenantId}`,
                    clientCertificate: {
                        thumbprint: this._spConfig.certificateThumbprint, // can be obtained when uploading certificate to Azure AD
                        privateKey: privateKey,
                    }
                },
                system: {
                    loggerOptions: {
                        // loggerCallback(loglevel, message, containsPii) {
                        //     console.log('loglevel', loglevel, message);
                        // },
                        piiLoggingEnabled: false,
                        logLevel: msal.LogLevel.Verbose,
                    },
                }
            };
            // console.log("config", config);
            // Create msal application object
            const cca = new msal.ConfidentialClientApplication(config);

            const tokenRequest: msal.ClientCredentialRequest = {
                scopes: [`${this._spConfig.webUrl}/.default`],
            };
            cca.acquireTokenByClientCredential(tokenRequest).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(JSON.stringify(error));
            });
        });
    }
}


