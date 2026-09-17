import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import { revalidateHome } from "@/lib/seo";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

// Latin names give a readable slug; Armenian or Russian ones fall back to a
// random suffix rather than a transliteration nobody asked for. The slug is
// only an internal unique key today — no lecturer pages are linked by it yet.
function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `lecturer-${crypto.randomBytes(4).toString("hex")}`;
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const lecturers = await prisma.lecturer.findMany({
    orderBy: [{ order: "asc" }, { nameHy: "asc" }],
    omit: { photoData: true },
  });
  return NextResponse.json(lecturers);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  };

  const nameHy = text("nameHy");
  const nameRu = text("nameRu");
  const nameEn = text("nameEn");
  if (!nameHy && !nameRu && !nameEn) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }

  // The schema requires all three names, so a missing one repeats whichever
  // was filled in — better a Russian name on the English page than a blank.
  const anyName = (nameHy ?? nameRu ?? nameEn)!;

  let photoData: Uint8Array<ArrayBuffer> | null = null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "image_too_large" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "unsupported_type" }, { status: 400 });
    }
    try {
      const compressed = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        // Square crop: these are shown as circles, so cropping here keeps the
        // face centred instead of relying on CSS to hide the wrong half.
        .resize(600, 600, { fit: "cover" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
      photoData = new Uint8Array(compressed);
    } catch {
      return NextResponse.json({ error: "invalid_image" }, { status: 400 });
    }
  }

  const orderRaw = text("order");
  const lecturer = await prisma.lecturer.create({
    data: {
      slug: slugify(nameEn ?? anyName),
      nameHy: nameHy ?? anyName,
      nameRu: nameRu ?? anyName,
      nameEn: nameEn ?? anyName,
      titleHy: text("titleHy"),
      titleRu: text("titleRu"),
      titleEn: text("titleEn"),
      bioHy: text("bioHy"),
      bioRu: text("bioRu"),
      bioEn: text("bioEn"),
      telegram: text("telegram"),
      instagram: text("instagram"),
      facebook: text("facebook"),
      youtube: text("youtube"),
      website: text("website"),
      order: orderRaw ? Number(orderRaw) || 0 : 0,
      photoData,
      photoMime: photoData ? "image/jpeg" : null,
    },
    omit: { photoData: true },
  });

  revalidateHome();
  return NextResponse.json(lecturer, { status: 201 });
}
