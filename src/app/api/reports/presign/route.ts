import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import r2Client from '@/lib/r2';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'tvgph_secret_key_123';
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

export async function POST(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    
    // Body parse para pegar os detalhes do arquivo requisitado
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Faltam propriedades relativas ao arquivo' }, { status: 400 });
    }

    // Criar chave do objeto com UUID p/ não sobrescrever (ex: reports/2026-W22/uuid-meuarquivo.mp4)
    const fileExtension = filename.split('.').pop();
    const uniqueId = crypto.randomUUID();
    const objectKey = `reports/${decoded.userId}/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType, // O Content-Type deve bater exatamente ao do PUT Request que o client vai fazer
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 }); // Validade 1 hora

    return NextResponse.json({ 
      url: presignedUrl, 
      objectKey 
    }, { status: 200 });

  } catch (error) {
    console.error('Presigner Error:', error);
    return NextResponse.json({ error: 'Falha ao assinar a requisição de upload' }, { status: 500 });
  }
}
