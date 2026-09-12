import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/adminAuth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.villagePhoto.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (photo.status !== "approved") {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!isValidAdminToken(token)) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
  }

  return new NextResponse(new Uint8Array(photo.imageData), {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": photo.status === "approved" ? "public, max-age=31536000, immutable" : "no-store",
    },
  });
}
