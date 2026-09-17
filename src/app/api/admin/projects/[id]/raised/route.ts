import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/adminAuth";
import { revalidateVillage } from "@/lib/seo";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const raisedAmount = body?.raisedAmount;
  if (typeof raisedAmount !== "number" || !Number.isFinite(raisedAmount) || raisedAmount < 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  const { id } = await params;
  const updated = await prisma.project.updateMany({
    where: { id },
    data: { raisedAmount: Math.round(raisedAmount) },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const project = await prisma.project.findUnique({ where: { id }, select: { village: { select: { slug: true } } } });
  if (project) revalidateVillage(project.village.slug);

  return NextResponse.json({ ok: true });
}
