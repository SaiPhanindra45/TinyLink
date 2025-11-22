import { NextResponse } from 'next/server';
// Revert to clean alias syntax now that next.config.ts is fixed
import { prisma } from '@/lib/prisma'; 

// This dynamic API route handles operations on a single short link: /api/links/:code

// ===================================
// GET /api/links/:code - Get stats for one code (Required route)
// ===================================
export async function GET(request: Request, { params }: { params: { code: string } }) {
  const code = params.code;
  try {
    const link = await prisma.link.findUnique({ where: { short_code: code } });
    
    if (link) {
      return NextResponse.json(link);
    } else {
      return new NextResponse("Link Not Found", { status: 404 }); 
    }
  } catch (error) {
    console.error("Error fetching single link:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// ===================================
// DELETE /api/links/:code - Delete link (Required route)
// ===================================
export async function DELETE(request: Request, { params }: { params: { code: string } }) {
  const code = params.code;
  try {
    // Delete the link from the database.
    await prisma.link.delete({ where: { short_code: code } });
    
    // Must return 204 No Content for a successful deletion.
    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    // Prisma error P2025 means "Record not found"
    if (error.code === 'P2025') {
        return new NextResponse("Link not found", { status: 404 });
    }
    console.error("Error deleting link:", error);
    return new NextResponse("Failed to delete link", { status: 500 });
  }
}