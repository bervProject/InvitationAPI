import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

export class IaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repo = ecr.Repository.fromRepositoryName(this, "ia-ecr", "invitation-api");

    const imageTag = new cdk.CfnParameter(this, "imageTag", {
      type: "String",
      description: "Target tag",
    });

    const secrets = Secret.fromSecretNameV2(
      this,
      "ecs-secret",
      "dev/AppRunner/ia",
    );

    // Task Execution Role - for ECS to pull images and write logs
    const taskExecutionRole = new iam.Role(this, "IaTaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      roleName: "IaEcsTaskExecutionRole",
      description: "Role for ECS tasks to pull images and write logs",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSTaskExecutionRolePolicy",
        ),
      ],
    });

    // Add CloudWatch Logs permissions to execution role
    taskExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: [
          `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/ecs/ia-express*`,
        ],
      }),
    );

    // Add Secrets Manager permissions to execution role
    taskExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["secretsmanager:GetSecretValue"],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:dev/AppRunner/ia-*`,
        ],
      }),
    );

    // Task Role - for application runtime permissions
    const taskRole = new iam.Role(this, "IaTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      roleName: "IaEcsTaskRole",
      description: "Role for application runtime permissions",
    });

    // Add S3 permissions for application data access
    taskRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
        resources: ["*"],
      }),
    );

    // Infrastructure Role - for Express Mode to manage AWS resources
    const infrastructureRole = new iam.Role(this, "IaInfrastructureRole", {
      assumedBy: new iam.ServicePrincipal("ecs.amazonaws.com"),
      roleName: "IaEcsInfrastructureRole",
      description: "Role for ECS Express Mode to manage infrastructure",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSInfrastructureRoleforExpressGatewayServices",
        ),
      ],
    });

    // Build image URI
    const imageUri = `${repo.repositoryUri}:${imageTag.valueAsString}`;

    const expressService = new ecs.CfnExpressGatewayService(
      this,
      "ia-ecs-express",
      {
        serviceName: "ia-express-service",
        executionRoleArn: taskExecutionRole.roleArn,
        infrastructureRoleArn: infrastructureRole.roleArn,
        taskRoleArn: taskRole.roleArn,
        cpu: "256",
        memory: "512",
        healthCheckPath: "/",
        scalingTarget: {
          autoScalingMetric: "REQUEST_COUNT_PER_TARGET",
          autoScalingTargetValue: 20,
          minTaskCount: 1,
          maxTaskCount: 2,
        },
        primaryContainer: {
          image: imageUri,
          containerPort: 3030,
          environment: [
            { name: "NODE_ENV", value: "production" },
            { name: "PORT", value: "3030" },
          ],
          secrets: [
            {
              name: "MONGO_CONNECTION_STRING",
              valueFrom: `${secrets.secretArn}:MONGO_CONNECTION_STRING::`,
            },
          ],
          awsLogsConfiguration: {
            logGroup: `/aws/ecs/ia-express`,
            logStreamPrefix: "ia",
          },
        },
      },
    );

    // Ensure roles are created before the service
    expressService.node.addDependency(taskExecutionRole);
    expressService.node.addDependency(taskRole);
    expressService.node.addDependency(infrastructureRole);

    new cdk.CfnOutput(this, "output-ia-ecs-url", {
      value: expressService.attrEndpoint,
    });
  }
}
