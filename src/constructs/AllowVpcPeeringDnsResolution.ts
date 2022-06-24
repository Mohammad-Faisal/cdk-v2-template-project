import ec2 = require("aws-cdk-lib/aws-ec2");
import iam = require("aws-cdk-lib/aws-iam");
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface AllowVPCPeeringDNSResolutionProps {
  vpcPeering: ec2.CfnVPCPeeringConnection;
}

export class AllowVPCPeeringDNSResolution extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: AllowVPCPeeringDNSResolutionProps
  ) {
    super(scope, id);

    const onCreate: AwsSdkCall = {
      service: "EC2",
      action: "modifyVpcPeeringConnectionOptions",
      parameters: {
        VpcPeeringConnectionId: props.vpcPeering.ref,
        AccepterPeeringConnectionOptions: {
          AllowDnsResolutionFromRemoteVpc: true,
        },
        RequesterPeeringConnectionOptions: {
          AllowDnsResolutionFromRemoteVpc: true,
        },
      },
      physicalResourceId: PhysicalResourceId.of(
        `allowVPCPeeringDNSResolution:${props.vpcPeering.ref}`
      ),
    };
    const onUpdate = onCreate;
    const onDelete: AwsSdkCall = {
      service: "EC2",
      action: "modifyVpcPeeringConnectionOptions",
      parameters: {
        VpcPeeringConnectionId: props.vpcPeering.ref,
        AccepterPeeringConnectionOptions: {
          AllowDnsResolutionFromRemoteVpc: false,
        },
        RequesterPeeringConnectionOptions: {
          AllowDnsResolutionFromRemoteVpc: false,
        },
      },
    };

    const customResource = new AwsCustomResource(
      this,
      "allow-peering-dns-resolution",
      {
        policy: AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ["*"],
            actions: ["ec2:ModifyVpcPeeringConnectionOptions"],
          }),
        ]),
        logRetention: RetentionDays.ONE_DAY,
        onCreate,
        onUpdate,
        onDelete,
      }
    );

    customResource.node.addDependency(props.vpcPeering);
  }
}
