import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  Duration,
  CfnOutput,
  aws_apigateway as apigateway,
  aws_lambda as lambda,
  aws_secretsmanager as secretsmanager,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { SecureRestApi } from "../constructs/SecureRestApi";
import { CommonLambdaFunction } from "../constructs/CommonLambdaFunction";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export interface LambdaInVpcStackProps extends StackProps {
  readonly vpc: ec2.Vpc;
  readonly securityGroup: ec2.SecurityGroup;
}

export class LambdaInVpcStack extends Stack {
  public readonly urlOutput: CfnOutput;
  constructor(scope: Construct, id: string, props: LambdaInVpcStackProps) {
    super(scope, id, props);

    const api = new SecureRestApi(this, "LambdaInVpcApi", {
      apiName: "LambdaInVpcApi",
    });

    const myLambda = new NodejsFunction(this, "ConnectToRdsLambda", {
      runtime: lambda.Runtime.NODEJS_14_X,
      entry: path.join(__dirname, "../lambdas/connect-to-rds/app.ts"),
      handler: "handler",
      timeout: Duration.seconds(20),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      securityGroups: [props.securityGroup],
    });

    api.addLambdaIntegrationRoute("connect", "GET", myLambda);

    this.urlOutput = new CfnOutput(this, "apiUrl", { value: api.restAPI.url });
  }
}
