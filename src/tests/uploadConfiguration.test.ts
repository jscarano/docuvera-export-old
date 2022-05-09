import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../lambdas/uploadConfigFunction';
import { ConfigurationType, Configurations } from '../types/configurationTable';
import { ITenantConfiguration } from '../interfaces/ITenantConfiguration';

const config: ITenantConfiguration = {
    tenantId: 'TESTING',
    name: 'TESTING',
    destination: {
        sp: {
            clientId: "",
            tenantId: "",
            webUrl: "",
            libraryTitle: "",
            certificateThumbprint: ""
        }
    }
};

const tableEntry: ConfigurationType = {
  pk: 'TESTING',
  sk: 'TESTING',
  config: JSON.stringify(config),
  type: 'config',
  date: new Date().toISOString(),
};

describe('Write Function', () => {
  beforeAll(() => {
    jest.spyOn(Configurations, 'create').mockReturnValue(Promise.resolve(tableEntry));
  });
  test('Return a 200 response', async () => {
    const response = await handler({body: JSON.stringify(tableEntry)} as APIGatewayProxyEventV2);
    console.log("upload configuration - test", response);
    expect(response).toMatchObject({
      body: tableEntry,
      statusCode: 200,
    });
  });
});
