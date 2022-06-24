// import { LambdaRestApi } from "@aws-cdk/aws-apigateway";
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
    const integration = new apigateway.LambdaIntegration(lambdaFn);
    const path = this.restAPI.root.addResource(route);
    path.addMethod(httpMethod, integration, {
      authorizer, // <--- if authorizer is not specified then the api will be public access
    });
  }
}
