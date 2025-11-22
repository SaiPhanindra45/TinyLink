import { NextResponse } from 'next/server';
// Revert to clean alias syntax now that next.config.ts is fixed
import { prisma } from '@/lib/prisma'; 
import { generateShortCode, isValidUrl } from '@/lib/utils'; 

// ===================================
// GET /api/links - List all links
// ===================================
export async function GET() {
  try {
    const links = await prisma.link.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json(links);
  } catch (error: any) { 
    console.error("Error fetching links (GET /api/links):", error);
    return NextResponse.json({ 
      error: "Failed to load links from the server.", 
      details: error.message || "Unknown database error." 
    }, { status: 500 });
  }
}

// ===================================
// POST /api/links - Create new link
// ===================================
export async function POST(request: Request) {
  const { target_url, custom_code } = await request.json();

  // 1. Validation Checks
  if (!target_url || !isValidUrl(target_url)) {
    return NextResponse.json({ error: "A valid Target URL is required." }, { status: 400 });
  }

  // 2. Determine short code (enforcing 6-8 alphanumeric)
  const short_code = (custom_code && custom_code.length > 0) ? custom_code : generateShortCode();

  try {
    // 3. Save to database
    const link = await prisma.link.create({
      data: { short_code, target_url }
    });
    return NextResponse.json(link, { status: 201 });
  } catch (error: any) { 
    // Check for unique constraint violation (P2002)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: `The code '${short_code}' is already in use. Please try another.` }, { status: 409 });
    }
    console.error("Database error during link creation (POST /api/links):", error);
    return NextResponse.json({ 
      error: "Internal Server Error during link creation.",
      details: error.message || "Unknown database error." 
    }, { status: 500 });
  }
}