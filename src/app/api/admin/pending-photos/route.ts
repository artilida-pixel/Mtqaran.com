import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/adminAuth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const pending = await prisma.villagePhoto.findMany({
    where: { status: "pending" },
    include: { village: true },
    orderBy: { createdAt: "asc" },
    omit: { imageData: true },
  });

  return NextResponse.json(pending);
}
