import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { AwsCustomResource, AwsSdkCall } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

/**
 * When we need to deploy resources into multiple region and need to
 */

interface SSMParameterReaderProps {
  parameterName: string;
  region: string;
}

export class SSMParameterReader extends AwsCustomResource {
  constructor(scope: Construct, name: string, props: SSMParameterReaderProps) {
    const { parameterName, region } = props;

    const ssmAwsSdkCall: AwsSdkCall = {
      service: "SSM",
      action: "getParameter",
      parameters: {
        Name: parameterName,
      },
      region,
      physicalResourceId: { id: Date.now().toString() }, // Update physical id to always fetch the latest version
    };

    super(scope, name, {
      onUpdate: ssmAwsSdkCall,
      policy: {
        statements: [
          new PolicyStatement({
            resources: ["*"],
            actions: ["ssm:GetParameter"],
            effect: Effect.ALLOW,
          }),
        ],
      },
    });
  }

  public getParameterValue(): string {
    return this.getResponseField("Parameter.Value").toString();
  }
}
