import {
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  aws_ec2 as ec2,
  aws_rds as rds,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface RdsStackProps extends StackProps {
  readonly vpc: ec2.Vpc;
  readonly lambdaSecurityGroup: ec2.SecurityGroup;
}

export class RdsStack extends Stack {
  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    // create a security group that will allow connection from the lambda security group
    // then pass that inside securityGroups params
    // For the Lambda function's security group, make sure that traffic is allowed to go in and out of the CIDR of the RDS instance's VPC.

    // For the RDS instance's security group, make sure that traffic is allowed to go in and out of the CIDR of the Lambda function's security group.
    // Example inbound rule for an RDS instance in a different VPC than the Lambda function

    const dbsg = new ec2.SecurityGroup(this, "DatabaseSecurityGroup", {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: id + "Database",
      securityGroupName: id + "Database",
    });

    dbsg.addIngressRule(dbsg, ec2.Port.allTraffic(), "all from self");

    dbsg.addIngressRule(
      props.lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      "all from the lambda security group"
    );

    const dbInstance = new rds.DatabaseInstance(this, "db-instance", {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_1,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      credentials: rds.Credentials.fromGeneratedSecret("postgres"),
      multiAz: false,
      allocatedStorage: 100,
      maxAllocatedStorage: 105,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: "todosdb",
      publiclyAccessible: false,
      securityGroups: [dbsg],
    });

    // dbInstance.connections.allowFrom(ec2Instance, ec2.Port.tcp(5432));

    new CfnOutput(this, "dbEndpoint", {
      value: dbInstance.instanceEndpoint.hostname,
    });

    new CfnOutput(this, "secretName", {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      value: dbInstance.secret?.secretName!,
    });
  }
}
