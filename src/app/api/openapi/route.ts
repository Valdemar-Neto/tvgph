import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface OpenAPISpec {
  servers?: Array<{ url: string; description?: string }>;
  [key: string]: any;
}

export async function GET(req: Request) {
  try {
    const filePath = path.join(process.cwd(), 'openapi.yml');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents) as OpenAPISpec;

    // Inject dynamic server URL based on current host
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    data.servers = [
      {
        url: `${baseUrl}/api`,
        description: 'Auto-detected Server'
      }
    ];

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading openapi.yml:', error);
    return NextResponse.json({ error: 'Failed to load OpenAPI spec' }, { status: 500 });
  }
}
