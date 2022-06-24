import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ServerlessStack } from "../stacks/ServerlessStack";

export class ServerlessAppStage extends cdk.Stage {
  public readonly urlOutput: CfnOutput;
  constructor(scope: Construct, stageName: string, props?: cdk.StageProps) {
    super(scope, stageName, props);

    const authStack = new ServerlessStack(this, `AuthenticationService`, {
      stageName,
    });

    this.urlOutput = authStack.urlOutput;
  }
}
