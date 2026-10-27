import { fileURLToPath } from 'node:url'
import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as deploy from 'aws-cdk-lib/aws-s3-deployment'

const path = (p) => fileURLToPath(new URL(p, import.meta.url))

// One CloudFront domain serves everything:
//   /*        → React app (S3)
//   /api/*    → Express API (Lambda behind an HTTP API; function URLs aren't offered in every region)
//   /media/*  → uploaded photos (S3)
export class SiteStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props)
    for (const name of ['ADMIN_PASSWORD_HASH', 'JWT_SECRET']) {
      if (!process.env[name]) throw new Error(`${name} is missing from backend/.env`)
    }

    const table = new dynamodb.TableV2(this, 'Table', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: RemovalPolicy.RETAIN,
    })

    const media = new s3.Bucket(this, 'Media', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      cors: [{ allowedMethods: [s3.HttpMethods.PUT], allowedOrigins: ['*'], allowedHeaders: ['*'] }],
      removalPolicy: RemovalPolicy.RETAIN,
    })

    const site = new s3.Bucket(this, 'Site', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const api = new NodejsFunction(this, 'Api', {
      entry: path('../../backend/src/lambda.js'),
      projectRoot: path('../../backend'),
      depsLockFilePath: path('../../backend/package-lock.json'),
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 512,
      timeout: Duration.seconds(10),
      bundling: {
        format: OutputFormat.ESM,
        target: 'node22',
        // Bundle the AWS SDK too, so Lambda runs the version in package-lock rather than the runtime's copy.
        externalModules: [],
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
        // Ship backend/.env with the code (lambda.js loads it). AWS_* lines stay behind: Lambda uses its own role.
        commandHooks: {
          beforeBundling: () => [],
          beforeInstall: () => [],
          afterBundling: (inputDir, outputDir) => [`grep -v '^AWS_' "${inputDir}/.env" > "${outputDir}/.env"`],
        },
      },
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: media.bucketName,
      },
    })
    table.grantReadWriteData(api)
    media.grantPut(api)
    const http = new apigw.HttpApi(this, 'HttpApi', { defaultIntegration: new HttpLambdaIntegration('Api', api) })

    // Send every non-file path to index.html so React Router can handle it.
    const spa = new cloudfront.Function(this, 'SpaRewrite', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(
        "function handler(event) { var r = event.request; if (r.uri.indexOf('.') === -1) r.uri = '/index.html'; return r; }",
      ),
    })

    const cdn = new cloudfront.Distribution(this, 'Cdn', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(site),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [{ function: spa, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST }],
      },
      additionalBehaviors: {
        'api/*': {
          origin: new origins.HttpOrigin(`${http.apiId}.execute-api.${this.region}.amazonaws.com`),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
        'media/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(media),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    })

    new deploy.BucketDeployment(this, 'DeploySite', {
      sources: [deploy.Source.asset(path('../../frontend/dist'))],
      destinationBucket: site,
      distribution: cdn,
      distributionPaths: ['/*'],
    })

    new CfnOutput(this, 'Url', { value: `https://${cdn.distributionDomainName}` })
    new CfnOutput(this, 'TableName', { value: table.tableName })
    new CfnOutput(this, 'MediaBucket', { value: media.bucketName })
  }
}
