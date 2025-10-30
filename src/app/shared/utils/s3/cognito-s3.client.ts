import { S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { environment } from '../../../../environments/environment';

export const s3Client = new S3Client({
  region: environment.aws.region,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: environment.aws.region },
    identityPoolId: environment.aws.cognito.identityPoolId,
  }),
});
