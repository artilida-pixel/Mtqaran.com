import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB raw upload, before compression
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const villageId = form.get("villageId");
  const caption = form.get("caption");
  const submittedBy = form.get("submittedBy");
  const contact = form.get("contact");
  const file = form.get("photo");

  if (typeof villageId !== "string" || !villageId) {
    return NextResponse.json({ error: "invalid_fields" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_photo" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "photo_too_large" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 400 });
  }

  const village = await prisma.village.findUnique({ where: { id: villageId } });
  if (!village) {
    return NextResponse.json({ error: "village_not_found" }, { status: 404 });
  }

  const raw = Buffer.from(await file.arrayBuffer());
  let compressed: Buffer;
  try {
    compressed = await sharp(raw)
      .rotate() // apply EXIF orientation before stripping metadata
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "invalid_image" }, { status: 400 });
  }

  const photo = await prisma.villagePhoto.create({
    data: {
      villageId,
      imageData: new Uint8Array(compressed),
      mimeType: "image/jpeg",
      caption: typeof caption === "string" ? caption.slice(0, 500) : null,
      submittedBy: typeof submittedBy === "string" ? submittedBy.slice(0, 120) : null,
      contact: typeof contact === "string" ? contact.slice(0, 200) : null,
      status: "pending",
    },
  });

  return NextResponse.json({ id: photo.id }, { status: 201 });
}
