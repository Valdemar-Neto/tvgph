import { S3Client } from '@aws-sdk/client-s3';

const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY;
const SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY;

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
  throw new Error('As variáveis de ambiente do Cloudflare R2 não estão configuradas corretamente.');
}

const r2Client = new S3Client({
  region: 'auto', // R2 requer que a region seja 'auto'
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

export default r2Client;
