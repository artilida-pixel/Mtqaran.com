import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { villageId, title, description, goalAmount, contact } = body as Record<string, unknown>;

  if (
    typeof villageId !== "string" ||
    typeof title !== "string" ||
    !title.trim() ||
    typeof goalAmount !== "number" ||
    !Number.isFinite(goalAmount) ||
    goalAmount <= 0
  ) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }

  const village = await prisma.village.findUnique({ where: { id: villageId } });
  if (!village) {
    return NextResponse.json({ error: "village_not_found" }, { status: 404 });
  }

  const trimmedTitle = title.trim();
  const desc = typeof description === "string" ? description.slice(0, 2000) : null;
  const project = await prisma.project.create({
    data: {
      villageId,
      type: "other",
      titleHy: trimmedTitle,
      titleRu: trimmedTitle,
      titleEn: trimmedTitle,
      descriptionHy: desc,
      descriptionRu: desc,
      descriptionEn: desc,
      goalAmount: Math.round(goalAmount),
      status: "pending",
      contact: typeof contact === "string" ? contact.slice(0, 200) : null,
    },
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
}
