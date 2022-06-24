import {
  Duration,
  StackProps,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export interface CommonLambdaFunctionProps extends StackProps {
  functionPath: string;
  functionName: string;
}

export class CommonLambdaFunction extends Construct {
  public function: NodejsFunction;
  constructor(scope: Construct, id: string, props: CommonLambdaFunctionProps) {
    super(scope, id);
    this.function = this.createLambdaFunction(
      props.functionName,
      props.functionPath
    );
  }
  private createLambdaFunction(
    functionName: string,
    functionPath: string
  ): NodejsFunction {
    const myLambda = new NodejsFunction(this, functionName, {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: path.join(__dirname, functionPath),
      handler: "handler",
      timeout: Duration.seconds(20),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
    });
    return myLambda;
  }
}
