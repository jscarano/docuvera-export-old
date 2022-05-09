import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { IEvent } from "../interfaces/IEvent";

export const handler = (event: IEvent): Promise<any> => {
    return new Promise<any>(async (resolve, reject) => {
        const client = new SFNClient({ region: 'us-east-1' });

        // TODO: Need to get these values at runtime.
        // maybe a config file and the input would have to be the data from Docuvera
        const input = {};
        const executionName = "";
        const sfARN = "";

        try {
            const command = new StartExecutionCommand(
                {
                    input: JSON.stringify(input),
                    name: executionName,
                    stateMachineArn: sfARN
                }
            );
            const response =  await client.send(command);
    
            resolve(response);    
        } catch (error) {
            reject(error);
        }        
    });
}