import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import { revalidateHome } from "@/lib/seo";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.published !== "boolean") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const updated = await prisma.newsItem.updateMany({
    where: { id },
    data: { published: body.published },
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  revalidateHome();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await prisma.newsItem.deleteMany({ where: { id } });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  revalidateHome();
  return NextResponse.json({ ok: true });
}
