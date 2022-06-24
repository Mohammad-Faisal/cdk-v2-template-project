import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  CfnOutput,
  aws_ssm as ssm,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcConstruct } from "../constructs/VpcConstruct";
import { VpcPeeringConstruct } from "../constructs/VpcPeeringConstruct";

interface VpcStackProps extends StackProps {
  cidrRange: string;
}

export class VpcStack extends Stack {
  readonly createdVpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const redVpc = new VpcConstruct(this, "Red-Vpc", {
      vpcName: "Shared",
      cidr: props.cidrRange,
      maxAzs: 1,
    });

    this.createdVpc = redVpc.createdVpc;

    const ssmParam = new ssm.StringParameter(this, `sharedVpcId`, {
      parameterName: `sharedVpcId`,
      stringValue: redVpc.createdVpc.vpcId,
    });

    new CfnOutput(this, "apiUrl", { value: redVpc.createdVpc.vpcId });
    new CfnOutput(this, "ssmId", { value: ssmParam.parameterName });
  }
}
