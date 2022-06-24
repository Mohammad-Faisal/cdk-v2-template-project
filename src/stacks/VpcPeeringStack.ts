import { Stack, Fn, StackProps, aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";
import { DifferentRegionVpcPeeringConstruct } from "../constructs/DifferentRegionVpcPeeringConstruct";
import { SSMParameterReader } from "../constructs/SsmParameterReader";
import { VpcConstruct } from "../constructs/VpcConstruct";
import { VpcPeeringConstruct } from "../constructs/VpcPeeringConstruct";

interface VpcPeeringStackProps extends StackProps {
  // upstreamVpcId: string;
  // vpcList: [ec2.Vpc, ec2.Vpc];
  // vpcIds: [string, string];
}

export class VpcPeeringStack extends Stack {
  readonly createdVpc: ec2.Vpc; // <-- create a class property for exposing the list of VPC objects

  constructor(scope: Construct, id: string, props: VpcPeeringStackProps) {
    super(scope, id, props);

    const blueVpc = new VpcConstruct(this, "Blue-Vpc", {
      vpcName: "Dedicated-Blue",
      cidr: "10.1.0.0/16",
      maxAzs: 1,
    });

    const sharedVpcId = new SSMParameterReader(this, "sharedVpcId", {
      parameterName: `sharedVpcId`,
      region: "us-west-1",
    }).getParameterValue();

    const redVpc: ec2.Vpc = ec2.Vpc.fromLookup(this, "ImportVPC", {
      vpcId: sharedVpcId,
      region: "us-west-1",
    }) as ec2.Vpc;

    const peeringConnection = new VpcPeeringConstruct(this, "Peering", {
      vpcs: [blueVpc.createdVpc, redVpc],
    });

    // const redVpc = ec2.Vpc.fromVpcAttributes(this, "ImportVPC", {
    //   vpcId: "vpc-004a17a56729656aa",
    //   availabilityZones: ["us-west-1a"],
    //   privateSubnetIds: ["subnet-0770d009faafa6b6f"],
    //   privateSubnetRouteTableIds: ["rtb-0a27e50d2fd8f77f6"],
    //   publicSubnetIds: ["subnet-064c924a8ed8b0449"],
    //   publicSubnetRouteTableIds: ["rtb-0f74daab88e94e7b0"],
    //   vpcCidrBlock: "10.0.0.0/16",
    // }) as ec2.Vpc;

    // const peeringConnection = new DifferentRegionVpcPeeringConstruct(
    //   this,
    //   "Peering",
    //   {
    //     // sourceVpc: blueVpc.createdVpc,
    //     // targetVpcId: "vpc-004a17a56729656aa",
    //     // targetVpcCidr: "10.0.0.0/16",
    //   }
    // );
  }
}
