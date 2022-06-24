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
import * as ec2 from "aws-cdk-lib/aws-ec2";

interface Ec2InstanceStackProps extends StackProps {
  vpcs: ec2.Vpc[]; // <--- a list of VPC objects required for the creation of the EC2 instance(s)
}

export class Ec2InstanceStack extends Stack {
  constructor(scope: Construct, id: string, props: Ec2InstanceStackProps) {
    super(scope, id, props);

    // For each supplied VPC, create a Linux-based EC2 instance in the private subnet and attach the VPC's default security group to it
    props.vpcs.forEach((vpc, index) => {
      const instanceName = `Instance${index}`;
      const instanceResource = new ec2.BastionHostLinux(this, instanceName, {
        vpc,
        instanceName,
        securityGroup: ec2.SecurityGroup.fromSecurityGroupId(
          this,
          instanceName + "SecurityGroup",
          vpc.vpcDefaultSecurityGroup
        ),
      });
      // Output the instance's private IP
      new CfnOutput(this, instanceName + "PrivateIp", {
        value: instanceResource.instancePrivateIp,
      });
    });
  }
}

// the following command tests the peering connection between
// i-033cc65f6dc40a2d1 is the source ec2 instance id and 10.0.2.217 is the destination private ip
// aws ssm send-command \
// --document-name "AWS-RunShellScript" \
// --document-version "1" \
// --targets '[{"Key":"InstanceIds","Values":["i-033cc65f6dc40a2d1"]}]' \
// --parameters '{"workingDirectory":[""],"executionTimeout":["3600"],"commands":["ping 10.0.2.217 -c 3"]}' \
// --timeout-seconds 600 \
// --max-concurrency "50" \
// --max-errors "0"
