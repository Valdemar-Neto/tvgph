import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'openapi.yml');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading openapi.yml:', error);
    return NextResponse.json({ error: 'Failed to load OpenAPI spec' }, { status: 500 });
  }
}
