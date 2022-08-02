import {
  Stack,
  StackProps,
  aws_logs as logs,
  aws_certificatemanager as certManager,
} from "aws-cdk-lib";
import { Construct, DependencyGroup as ConcreteDependable } from "constructs";
import {
  Vpc,
  CfnClientVpnTargetNetworkAssociation,
  CfnClientVpnEndpoint,
  CfnClientVpnAuthorizationRule,
  CfnClientVpnRoute,
} from "aws-cdk-lib/aws-ec2";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";

export interface VpnStackProps extends StackProps {
  readonly vpc: Vpc;
  // clientVpnCidrBlock: string;
  //   parsedEnv: IProcessEnv;
}

export class VpnStack extends Stack {
  readonly secret: ISecret;

  // creating server and clients certs is best done by following the AWS page on:
  // https://docs.aws.amazon.com/de_de/vpn/latest/clientvpn-admin/authentication-authorization.html#mutual
  serverArn =
    "arn:aws:acm:us-east-2:084406901092:certificate/226a3b52-6268-4a45-a312-63f70da136d7";
  clientArn =
    "arn:aws:acm:us-east-2:084406901092:certificate/63feee84-8383-4f17-b32b-3aaf15c9a006";
  clientVpnCidrBlock = "10.2.4.0/22";

  constructor(scope: Construct, id: string, props: VpnStackProps) {
    super(scope, id, props);

    const clientCert = certManager.Certificate.fromCertificateArn(
      this,
      "ClientCertificate",
      this.clientArn
    );
    const serverCert = certManager.Certificate.fromCertificateArn(
      this,
      "ServerCertificate",
      this.serverArn
    );

    const logGroup = new logs.LogGroup(this, "ClientVpnLogGroup", {
      retention: logs.RetentionDays.ONE_MONTH,
    });

    const logStream = logGroup.addStream("ClientVpnLogStream");

    const endpoint = new CfnClientVpnEndpoint(this, "ClientVpnEndpoint2", {
      description: "Client VPN Endpoint",
      authenticationOptions: [
        {
          type: "certificate-authentication",
          mutualAuthentication: {
            clientRootCertificateChainArn: clientCert.certificateArn,
          },
        },
      ],
      tagSpecifications: [
        {
          resourceType: "client-vpn-endpoint",
          tags: [
            {
              key: "Purpose",
              value: "Production",
            },
            {
              key: "Name",
              value: `vpn-stack`,
            },
          ],
        },
      ],
      clientCidrBlock: this.clientVpnCidrBlock,
      connectionLogOptions: {
        enabled: true,
        cloudwatchLogGroup: logGroup.logGroupName,
        cloudwatchLogStream: logStream.logStreamName,
      },
      serverCertificateArn: serverCert.certificateArn,
      // If you need to route all the traffic through the VPN (not only for the resources inside, turn this off)
      splitTunnel: true,
      dnsServers: ["10.1.0.2", "8.8.8.8", "8.8.4.4"],
      vpcId: props.vpc.vpcId,
      transportProtocol: "udp", // why?
    });

    let i = 0;
    const dependables = new ConcreteDependable();
    props?.vpc.privateSubnets.map((subnet) => {
      let networkAsc = new CfnClientVpnTargetNetworkAssociation(
        this,
        "ClientVpnNetworkAssociation-" + i,
        {
          clientVpnEndpointId: endpoint.ref,
          subnetId: subnet.subnetId,
        }
      );
      dependables.add(networkAsc);
      i++;
    });

    new CfnClientVpnAuthorizationRule(this, "ClientVpnAuthRule", {
      clientVpnEndpointId: endpoint.ref,
      targetNetworkCidr: "0.0.0.0/0",
      authorizeAllGroups: true,
      description: "Allow all",
    });

    // add routs for two subnets so that i can surf the internet while in VPN (useful when splitTunnel is off)
    // let x = 0;
    // props?.vpc.privateSubnets.map((subnet) => {
    //   new CfnClientVpnRoute(this, `CfnClientVpnRoute${x}`, {
    //     clientVpnEndpointId: endpoint.ref,
    //     destinationCidrBlock: '0.0.0.0/0',
    //     description: 'Route to all',
    //     targetVpcSubnetId: props?.vpc.privateSubnets[x].subnetId!,
    //   }).node.addDependency(dependables);
    //   x++;
    // });
  }
}
