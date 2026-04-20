import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import r2Client from '@/lib/r2';
import crypto from 'crypto';

import { getAuthSession } from '@/lib/auth';

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, contentType, isAvatar } = body;

    const decoded = getAuthSession();
    
    // If not avatar, authentication is required
    if (!isAvatar && !decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing file properties' }, { status: 400 });
    }

    const fileExtension = filename.split('.').pop();
    const uniqueId = crypto.randomUUID();
    
    // If avatar and no session (registration), use public folder
    // If there is a session, use the user ID
    const pathPrefix = isAvatar 
      ? (decoded ? `avatars/${decoded.userId}` : `avatars/public`)
      : `reports/${decoded?.userId}`;

    const objectKey = `${pathPrefix}/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType, // Content-Type must match exactly the PUT Request from the client
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 }); // Valid for 1 hour

    return NextResponse.json({ 
      url: presignedUrl, 
      objectKey 
    }, { status: 200 });

  } catch (error) {
    console.error('Presigner Error:', error);
    return NextResponse.json({ error: 'Failed to sign upload request' }, { status: 500 });
  }
}
