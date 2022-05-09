import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoClient } from '../services/dynamoClient';

export const handler = (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    return new Promise<APIGatewayProxyResultV2>((resolve, reject) => {
        const body  = event.body;
        if (body) {
            console.log("Upload Configuration", body);
            const client: DynamoClient = new DynamoClient();
            client.uploadConfiguration(JSON.parse(body)).then((response) => {
                resolve({ body: response, statusCode: 200 });
            });
        } else {
            reject({ body: 'Error, invalid input!', statusCode: 400 });
        }
    });
};
