import { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { AllowVPCPeeringDNSResolution } from "./AllowVpcPeeringDnsResolution";

interface VpcPeeringConstructProps extends StackProps {
  vpcs: [ec2.Vpc, ec2.Vpc];
}

export class VpcPeeringConstruct extends Construct {
  public readonly peeringConnection: ec2.CfnVPCPeeringConnection;

  constructor(scope: Construct, id: string, props: VpcPeeringConstructProps) {
    super(scope, id);

    // Create the peering connection
    const peer = new ec2.CfnVPCPeeringConnection(this, "Peer", {
      vpcId: props.vpcs[0].vpcId,
      peerVpcId: props.vpcs[1].vpcId,
      peerRegion: "us-west-1",
    });

    // Add route from the private subnet of the first VPC to the second VPC over the peering connection
    // NB the below was taken from: https://stackoverflow.com/questions/62525195/adding-entry-to-route-table-with-cdk-typescript-when-its-private-subnet-alread
    props.vpcs[0].isolatedSubnets.forEach(
      ({ routeTable: { routeTableId } }, index) => {
        new ec2.CfnRoute(this, "RouteFromPrivateSubnetOfVpc1ToVpc2" + index, {
          destinationCidrBlock: props.vpcs[1].vpcCidrBlock,
          routeTableId,
          vpcPeeringConnectionId: peer.ref,
        });
      }
    );

    // Add route from the private subnet of the second VPC to the first VPC over the peering connection
    // props.vpcs[1].isolatedSubnets.forEach(
    //   ({ routeTable: { routeTableId } }, index) => {
    //     new ec2.CfnRoute(this, "RouteFromPrivateSubnetOfVpc2ToVpc1" + index, {
    //       destinationCidrBlock: props.vpcs[0].vpcCidrBlock,
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
