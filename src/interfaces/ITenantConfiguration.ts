export interface ISPDestination {
    clientId: string;
    tenantId: string;
    webUrl: string;
    libraryTitle: string;
    folderPath?: string;
    certificateThumbprint: string;
}
export interface IAdobeDestination {

}
export interface ITenantConfiguration {
    tenantId: string;
    name: string;
    destination: {
        sp?: ISPDestination;
        aem?: IAdobeDestination;
    }
}

