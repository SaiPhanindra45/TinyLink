
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This dynamic route handles all short link requests: /:code
export async function GET(request: Request, { params }: { params: { code: string } }) {
  const code = params.code;

  // 1. Find the link in the database
  const link = await prisma.link.findUnique({ where: { short_code: code } });

  if (!link) {
    // If not found, must return 404 Not Found.
    return new NextResponse("Link Not Found", { status: 404 });
  }

  // 2. Update stats asynchronously
  // We update the click count and last clicked time in the database.
  try {
    await prisma.link.update({
      where: { id: link.id },
      data: {
        total_clicks: { increment: 1 },
        last_clicked_time: new Date()
      }
    });
  } catch (e) {
    // Log the error but proceed with the redirect so the user isn't affected.
    console.error("Failed to update link stats:", e);
  }

  // 3. Perform HTTP 302 Redirect
  // This sends the user to the original long URL.
  return NextResponse.redirect(link.target_url, 302);
}