import { NextResponse } from 'next/server';

// This is the GET /healthz endpoint.
// It serves as a simple check to ensure the application is running and accessible.
export async function GET() {
  // Must return HTTP status 200 for autograding tools.
  return NextResponse.json({ 
    ok: true, 
    version: "1.0" 
  }, { status: 200 }); 
}