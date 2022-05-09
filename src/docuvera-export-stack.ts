import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {
  RemovalPolicy,
  Stack,
  StackProps,
  CfnOutput,
} from 'aws-cdk-lib';
import { Pass, CfnStateMachine, StateMachineType } from 'aws-cdk-lib/aws-stepfunctions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StateMachine } from './classes/StateMachine';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { OriginAccessIdentity, Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { AwsCustomResource, PhysicalResourceId, AwsCustomResourcePolicy } from 'aws-cdk-lib/custom-resources';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Rule } from 'aws-cdk-lib/aws-events';
// import {
//   CfnOutput,
//   DockerImage,
//   RemovalPolicy,
//   Stack,
//   StackProps,
// } from 'aws-cdk-lib';
// import {
//   Distribution,
//   OriginAccessIdentity,
//   ViewerProtocolPolicy,
// } from 'aws-cdk-lib/aws-cloudfront';
// import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
// import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
// import { RetentionDays } from 'aws-cdk-lib/aws-logs';
// import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
// import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
// import {
//   AwsCustomResource,
//   AwsCustomResourcePolicy,
//   PhysicalResourceId,
// } from 'aws-cdk-lib/custom-resources';
// import { execSync, ExecSyncOptions } from 'child_process';

// import { copySync } from 'fs-extra';
// import { join } from 'path';

export class DocuveraExportStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const BASE_NAME = "DocuveraExport-";

    // Demo-quality props. For production, you want a different removalPolicy and possibly a different billingMode.
    const table = new Table(this, 'ConfigurationTable', {      
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      sortKey: { name: 'sk', type: AttributeType.STRING },
      tableName: 'ConfigurationTable',
    });


    const eventConsumerLambda = new NodejsFunction(this, "EventReceiverFn", {
      functionName: `${BASE_NAME}EventReceiver`,
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/lambdas/eventReceiverFunction.ts`,
      logRetention: RetentionDays.ONE_WEEK,          
    });

    const eventConsumerRule = new Rule(this, "EventReceiverFn-Rule", {
      description: "Approved Transactions",
      eventPattern: { source: ["com.mycompany.myapp"] },
    });

    eventConsumerRule.addTarget(new LambdaFunction(eventConsumerLambda));

    // Functions could have memory tuned to save $$, but should be pretty cheap in any case.
    const readConfigurationFunction = new NodejsFunction(this, 'ReadConfigurationFn', {
      functionName: `${BASE_NAME}ReadConfiguration`,
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/lambdas/readConfigurationFunction.ts`,
      logRetention: RetentionDays.ONE_WEEK,     
    });

    const uploadConfigFunction = new NodejsFunction(this, 'UploadConfigurationFn', {
      functionName: `${BASE_NAME}UploadConfiguration`,
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/lambdas/uploadConfigFunction.ts`,
      logRetention: RetentionDays.ONE_WEEK,     
    });

    table.grantReadData(readConfigurationFunction);
    table.grantWriteData(uploadConfigFunction);


    const convertFunction = new NodejsFunction(this, 'ConvertFn', {
      functionName: `${BASE_NAME}Convert`,
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_14_X,
      entry: `${__dirname}/lambdas/convertFunction.ts`,
      logRetention: RetentionDays.ONE_WEEK,     
    });

    // API could be improved with authorization and models to validate payloads.
    // In production, you will want access logging.
    const api = new HttpApi(this, 'ConfigApi', {
      corsPreflight: {
        allowHeaders: ['Content-Type'],
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowOrigins: ['*'],
      },
    });

    // Creates the Cfn AWS::ApiGatewayV2::Integration resources
    const readConfigurationIntegration = new HttpLambdaIntegration(
      'ReadConfigurationIntegration',
      readConfigurationFunction
    );
    const uploadConfigurationIntegration = new HttpLambdaIntegration(
      'UploadConfigurationIntegration',
      uploadConfigFunction
    );

    // Creates the Cfn AWS::ApiGatewayV2::Route resources, assigning a path to an integration
    api.addRoutes({
      integration: readConfigurationIntegration,
      methods: [HttpMethod.GET],
      path: '/config',
    });
    api.addRoutes({
      integration: uploadConfigurationIntegration,
      methods: [HttpMethod.POST],
      path: '/config',
    });


    // Create a state machine using JSON 
    // using example from https://github.com/mbonig/state-machine
    const secret = new Secret(this, 'Secret', {});
    const fs = require('fs');
    const path = require('path');
    const stateMachine = new StateMachine(this, 'MyStateMachine', {      
      stateMachineName: `${BASE_NAME}StateMachine`,
      definition: JSON.parse(fs.readFileSync(path.join(__dirname, './stateMachines/sample.json'), 'utf8').toString())
    });

    // Create a state machine using JSON 
    // You can also override nested states in arrays, for example:
    // new StateMachine(this, 'Test', {
    //   stateMachineName: 'A-nice-state-machine',
    //   overrides: {
    //     Branches: [{
    //       // pass an empty object too offset overrides
    //     }, {
    //       StartAt: 'StartInstances',
    //       States: {
    //         StartInstances: {
    //           Parameters: {
    //             InstanceIds: ['INSTANCE_ID'],
    //           },
    //         },
    //       },
    //     }],
    //   },
    //   stateMachineType: StateMachineType.STANDARD,
    //   definition: {
    //     States: {
    //       Branches: [
    //         {
    //           StartAt: 'ResumeCluster',
    //           States: {
    //             'Redshift Pass': {
    //               Type: 'Pass',
    //               End: true,
    //             },
    //           },
    //         },
    //         {
    //           StartAt: 'StartInstances',
    //           States: {
    //             'StartInstances': {
    //               Type: 'Task',
    //               Parameters: {
    //                 InstanceIds: [
    //                   'MyData',
    //                 ],
    //               },
    //               Resource: 'arn:aws:states:::aws-sdk:ec2:startInstances',
    //               Next: 'DescribeInstanceStatus',
    //             },
    //             'DescribeInstanceStatus': {
    //               Type: 'Task',
    //               Next: 'EC2 Pass',
    //               Parameters: {
    //                 InstanceIds: [
    //                   'MyData',
    //                 ],
    //               },
    //               Resource: 'arn:aws:states:::aws-sdk:ec2:describeInstanceStatus',
    //             },
    //             'EC2 Pass': {
    //               Type: 'Pass',
    //               End: true,
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   },
    // });

    // Storage for assets only. NOT an S3 website.
    const functionBucket = new Bucket(this, 'FunctionBucket', {
      bucketName: `${BASE_NAME}Bucket`.toLowerCase(),
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Grant read access to the distribution.
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity'
    );
    functionBucket.grantRead(originAccessIdentity);

    // Cloudfront distribution with SPA config and https upgrade.
    // const distribution = new Distribution(this, 'Distribution', {
    //   defaultBehavior: {
    //     origin: new S3Origin(functionBucket, { originAccessIdentity }),
    //     viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    //   },
    //   defaultRootObject: 'index.html',
    //   errorResponses: [
    //     {
    //       httpStatus: 404,
    //       responseHttpStatus: 200,
    //       responsePagePath: '/index.html',
    //     },
    //   ],
    // });

    // const execOptions: ExecSyncOptions = {
    //   stdio: ['ignore', process.stderr, 'inherit'],
    // };

    // Run vite build to transpile React application, then copy to cdk.out.
    // Docker build can't be omitted, even though we don't use it.
    // const bundle = Source.asset(join(__dirname, 'web'), {
    //   bundling: {
    //     command: [
    //       'sh',
    //       '-c',
    //       'echo "Docker build not supported. Please install esbuild."',
    //     ],
    //     image: DockerImage.fromRegistry('alpine'),
    //     local: {
    //       tryBundle(outputDir: string) {
    //         try {
    //           execSync('esbuild --version', execOptions);
    //         } catch {
    //           return false;
    //         }
    //         execSync('npx vite build', execOptions);
    //         copySync(join(__dirname, '../dist'), outputDir, {
    //           ...execOptions,
    //           recursive: true,
    //         });
    //         return true;
    //       },
    //     },
    //   },
    // });

    // Need to set prune to false or the config.json file will be pruned.
    // If deployments are frequent, should look into a way to clean up old files.
    // new BucketDeployment(this, 'DeployWebsite', {
    //   destinationBucket: websiteBucket,
    //   distribution,
    //   logRetention: RetentionDays.ONE_DAY,
    //   prune: false,
    //   sources: [bundle],
    // });

    // Generate a config.json file and place in S3 so the web app can grab the API URL.
    new AwsCustomResource(this, 'ApiUrlResource', {
      logRetention: RetentionDays.ONE_DAY,
      onUpdate: {
        action: 'putObject',
        parameters: {
          Body: Stack.of(this).toJsonString({
            [this.stackName]: { HttpApiUrl: api.apiEndpoint },
            stateMachineArn: stateMachine.stateMachineArn
          }),
          Bucket: functionBucket.bucketName,
          CacheControl: 'max-age=0, no-cache, no-store, must-revalidate',
          ContentType: 'application/json',
          Key: 'environment-config.json',
        },
        physicalResourceId: PhysicalResourceId.of('environment-config'),
        service: 'S3',
      },
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [functionBucket.arnForObjects('environment-config.json')],
        }),
      ]),
    });

    new CfnOutput(this, 'apiUrl', { value: api.apiEndpoint });


    // new CfnOutput(this, 'DistributionDomain', {
    //   value: distribution.distributionDomainName,
    // });
  }
}
