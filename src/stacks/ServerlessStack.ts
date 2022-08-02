import {
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  aws_apigateway as apigateway,
  aws_lambda as lambda,
  aws_secretsmanager as secretsmanager,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecureRestApi } from "../constructs/SecureRestApi";
import { CommonLambdaFunction } from "../constructs/CommonLambdaFunction";

export interface ServerlessStackProps extends StackProps {
  readonly stageName: string;
}

export class ServerlessStack extends Stack {
  public readonly urlOutput: CfnOutput;
  constructor(scope: Construct, id: string, props: ServerlessStackProps) {
    super(scope, id, props);

    const api = new SecureRestApi(this, "SecureRestApi", {
      apiName: "serverless-api",
    });

    const secret = new secretsmanager.Secret(this, "SecretValue", {
      secretName: "my-secret-token",
    });

    const myLambda = new CommonLambdaFunction(this, "SecretReaderLambda", {
      functionName: "secret-reader-lambda",
      functionPath: "../lambdas/secret-reader-lambda/app.ts",
    });

    /**
     * This is a special lambda tha is called on every request that reaches the api
     */
    const authLambda = new CommonLambdaFunction(this, "AuthorizerLambda", {
      functionName: "authorizer-lambda",
      functionPath: "../lambdas/auth-token-authorizer/app.ts",
    });

    /**
     * Add the authorizer to the API
     * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer.html
     * The header.ApiKey is the name of the header that contains the token
     * We have to pass the ApiKey token when calling the API
     */
    const tokenAuthorizer = new apigateway.TokenAuthorizer(
      this,
      "custom-authorizer",
      {
        handler: authLambda.function,
        identitySource: "method.request.header.ApiKey",
      }
    );

    /**
     * We are passing the tokenAuthorizer to the API path here
     */
    api.addLambdaIntegrationRoute(
      "read-secret",
      "GET",
      myLambda.function,
      tokenAuthorizer
    );

    secret.grantRead(myLambda.function);

    this.urlOutput = new CfnOutput(this, "apiUrl", { value: api.restAPI.url });
  }
}
