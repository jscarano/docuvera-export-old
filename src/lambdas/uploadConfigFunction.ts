import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Configurations } from '../types/configurationTable';

export const handle = (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    return new Promise<APIGatewayProxyResultV2>((resolve, reject) => {
        const body = event.body;
        if (body) {
            Configurations.create(JSON.parse(body)).then((config) => {
                resolve({ body: JSON.stringify(config), statusCode: 200 });
            });
        }
        reject({ body: 'Error, invalid input!', statusCode: 400 });
    });
};
