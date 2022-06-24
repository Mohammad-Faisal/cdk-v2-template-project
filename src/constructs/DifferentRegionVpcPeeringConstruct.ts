import { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AllowVPCPeeringDNSResolution } from "./AllowVpcPeeringDnsResolution";

interface DifferentRegionVpcPeeringProps extends StackProps {
  //   sourceVpc: ec2.Vpc;
  //   targetVpcId: string;
  //   targetVpcCidr: string;
}

export class DifferentRegionVpcPeeringConstruct extends Construct {
  public readonly peeringConnection: ec2.CfnVPCPeeringConnection;

  constructor(
    scope: Construct,
    id: string,
    props: DifferentRegionVpcPeeringProps
  ) {
    super(scope, id);

    // Create the peering connection
    const peer = new ec2.CfnVPCPeeringConnection(this, "Peer", {
      //   vpcId: props.sourceVpc.vpcId,
      vpcId: "vpc-0e5b7f2cf7b8d91e2",
      //   peerVpcId: props.targetVpcId,
      peerVpcId: "vpc-004a17a56729656aa",
      peerRegion: "us-west-1",
    });

    // props.sourceVpc.isolatedSubnets.forEach(
    //   ({ routeTable: { routeTableId } }, index) => {
    //     new ec2.CfnRoute(this, "RouteFromPrivateSubnetOfVpc1ToVpc2" + index, {
    //       destinationCidrBlock: props.targetVpcCidr,
    //       routeTableId,
    //       vpcPeeringConnectionId: peer.ref,
    //     });
    //   }
    // );

    // new AllowVPCPeeringDNSResolution(this, "Blue-Red-Peering-DNS-Resolution", {
    //   vpcPeering: peer,
    // });

    this.peeringConnection = peer;
  }
}
