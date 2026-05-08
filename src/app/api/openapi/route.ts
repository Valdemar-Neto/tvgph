import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export async function GET(req: Request) {
  try {
    const filePath = path.join(process.cwd(), 'openapi.yml');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents) as any;

    // Inject dynamic server URL based on current host
    const host = req.headers.get('host');
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
