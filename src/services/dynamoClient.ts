import { ITenantConfiguration } from "../interfaces/ITenantConfiguration";
import { Configurations, ConfigurationType } from "../types/configurationTable";

export class DynamoClient {
    public uploadConfiguration(configuration: ITenantConfiguration): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (configuration) {
                const tableEntry: ConfigurationType = {
                    type: "config",
                    pk: configuration.tenantId,
                    sk: configuration.name,
                    config: JSON.stringify(configuration),
                    date: new Date().toISOString()
                };
                Configurations.create(tableEntry).then((response) => {
                    resolve(response);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                reject("Missing Configuration");
            }
        });
    }

    public readConfiguration(tenantId: string): Promise<ITenantConfiguration | undefined>{
        return new Promise<ITenantConfiguration | undefined>((resolve, reject) => {
            Configurations.get({pk: tenantId}).then((tableEntry) => {
                if (tableEntry) {
                    resolve(JSON.parse(tableEntry.config));
                } else {
                    resolve(undefined);
                }                
            });
        });
    }
}