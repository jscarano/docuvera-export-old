import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity, Table } from 'dynamodb-onetable';
import Dynamo from 'dynamodb-onetable/Dynamo';

const client = new Dynamo({ client: new DynamoDBClient({}) });

const schema = {
  indexes: {
    primary: {
      hash: 'pk',
      sort: 'sk',
    },
  },
  models: {
    configuration: {
      type: {
        required: true,
        type: 'string',
        value: 'config',
      },
      pk: {
        type: 'string',
        value: 'tenantId',
      },
      sk: {
        type: 'string',
        value: 'name',
      },
      config: {
        required: true,
        type: 'string',
      },
      date: {
        required: true,
        type: 'string',
      }
    },
  },
  version: '0.1.0',
  params: {
    typeField: 'type',
  },
  format: 'onetable:1.0.0',
} as const;

export type ConfigurationType = Entity<typeof schema.models.configuration>;

const table = new Table({
  client,
  name: 'ConfigurationTable',
  schema,
  timestamps: true,
});

export const Configurations = table.getModel<ConfigurationType>('configuration');
