import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import { revalidateHome } from "@/lib/seo";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const { id } = await params;
  // A lecture pointing at this lecturer would block the delete, so unhook
  // them first — lectures stay, they just go back to showing the channel as
  // their source, which is what they do when no lecturer is set.
  await prisma.lecture.updateMany({ where: { lecturerId: id }, data: { lecturerId: null } });
  const deleted = await prisma.lecturer.deleteMany({ where: { id } });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  revalidateHome();
  return NextResponse.json({ ok: true });
}
