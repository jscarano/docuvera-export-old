import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import { Configurations } from '../types/configurationTable';

export const handler = async (tenantId: string): Promise<APIGatewayProxyResultV2> => {
  const notes = await Configurations.find({ pk: tenantId }, { limit: 1, reverse: true });
  return { body: JSON.stringify(notes), statusCode: 200 };
};
