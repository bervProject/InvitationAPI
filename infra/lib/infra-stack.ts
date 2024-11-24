import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";
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
      "apprunner-secret",
      "dev/AppRunner/ia",
    );

    // temporary role, reuse lambda
    const role = iam.Role.fromRoleName(this, "ia-role", "S3RoleLambda");

    const appRunner = new apprunner.Service(this, "ia-apprunner", {
      instanceRole: role,
      source: apprunner.Source.fromEcr({
        repository: repo,
        imageConfiguration: {
          port: 3030,
          environmentSecrets: {
            MONGO_CONNECTION_STRING: apprunner.Secret.fromSecretsManager(
              secrets,
              "MONGO_CONNECTION_STRING",
            ),
          },
        },
        tagOrDigest: imageTag.valueAsString,
      }),
    });

    new cdk.CfnOutput(this, "output-ia-apprunner-url", {
      value: appRunner.serviceUrl,
    });
  }
}