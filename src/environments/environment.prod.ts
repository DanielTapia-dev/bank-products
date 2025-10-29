export const environment = {
  production: true,
  apiUrl: '/bp',
  aws: {
    region: 'us-east-2',
    s3: {
      bucket: 'daniel-nttdata',
      prefix: 'products/',
      maxSizeMB: 5,
      allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      publicBaseUrl: '',
    },
    cognito: {
      identityPoolId: 'us-east-2:7dd387cd-1a34-42d7-be5e-8722787c3f9c',
    },
  },
};
