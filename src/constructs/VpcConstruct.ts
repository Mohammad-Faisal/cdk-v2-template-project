import { StackProps, aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";
interface VpcProps extends StackProps {
  vpcName: string;
  cidr: string; // <--- each VPC will need a list of CIDRs
  maxAzs?: number; // <--- optionally the number of Availability Zones can be provided; defaults to 2 in our particular case
  vpnConnections?: {
    // <--- if dealing with Site-to-Site VPN, the VPN connection details can be provided
    [id: string]: ec2.VpnConnectionOptions;
  };
}

export class VpcConstruct extends Construct {
  readonly createdVpc: ec2.Vpc; // <-- create a class property for exposing the list of VPC objects

  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id);

    const createdVpc: ec2.Vpc = new ec2.Vpc(this, props.vpcName, {
      cidr: props.cidr,
      maxAzs: props.maxAzs,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "private-isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        // {
        //   name: "private-nat",
        //   subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        //   cidrMask: 24,
        // },
      ],
      vpnConnections: props.vpnConnections,
    });

    const sg = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "DefaultSecurityGroup",
      createdVpc.vpcDefaultSecurityGroup
    );

    sg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.icmpPing(),
      "Allow ping from anywhere"
    );

    sg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "allow SSH access from anywhere"
    );

    this.createdVpc = createdVpc;
  }
}
