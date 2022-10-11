import {
  StackProps,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";
import {
  RestApi,
  AuthorizationType,
  TokenAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export interface SecureRestApiProps extends StackProps {
  apiName: string;
}

export class SecureRestApi extends Construct {
  public restAPI: RestApi;
  constructor(scope: Construct, id: string, props: SecureRestApiProps) {
    super(scope, id);
    this.restAPI = this.createGateway(props.apiName);
  }
  private createGateway(apiName: string): RestApi {
    const api = new apigateway.RestApi(this, apiName, {
      description: "A simple API",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });
    return api;
  }
  public addLambdaIntegrationRoute(
    route: string,
    httpMethod: string,
    lambdaFn: lambda.IFunction,
    authorizer: TokenAuthorizer
  ): void {
    const nonProxyIntegration = new apigateway.LambdaIntegration(lambdaFn, {
      proxy: false,
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH,
      requestTemplates: { "application/json": '{ "statusCode": 200 }' },
      integrationResponses: [
        {
          statusCode: "200",
        },
      ],
    });

    const proxyIntegration = new apigateway.LambdaIntegration(lambdaFn);

    const resource = this.restAPI.root.addResource(route);
    resource.addMethod(httpMethod, proxyIntegration, {
      authorizer,
      // this apigateway.AuthorizationType.IAM is required for authorizer to produce REQUEST type payload
      // else it will be TOKEN type
      authorizationType: authorizer
        ? apigateway.AuthorizationType.IAM
        : undefined,
      methodResponses: proxyIntegration
        ? []
        : [
            {
              statusCode: "200",
            },
          ],
    });
  }
}
