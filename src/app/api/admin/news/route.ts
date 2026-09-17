import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/adminAuth";
import { revalidateHome } from "@/lib/seo";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  const items = await prisma.newsItem.findMany({
    orderBy: { publishedAt: "desc" },
    omit: { imageData: true },
  });
  return NextResponse.json(items);
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

  const data = {
    titleHy: text("titleHy"),
    titleRu: text("titleRu"),
    titleEn: text("titleEn"),
    bodyHy: text("bodyHy"),
    bodyRu: text("bodyRu"),
    bodyEn: text("bodyEn"),
    sourceUrl: text("sourceUrl"),
  };

  // One title in any language is the minimum — the card has nothing to show
  // otherwise, and every language being optional is the whole point here.
  if (!data.titleHy && !data.titleRu && !data.titleEn) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  const publishedAtRaw = text("publishedAt");
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();
  if (Number.isNaN(publishedAt.getTime())) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  let imageData: Uint8Array<ArrayBuffer> | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "image_too_large" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "unsupported_type" }, { status: 400 });
    }
    try {
      const compressed = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate() // apply EXIF orientation before stripping metadata
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
      imageData = new Uint8Array(compressed);
    } catch {
      return NextResponse.json({ error: "invalid_image" }, { status: 400 });
    }
  }

  const item = await prisma.newsItem.create({
    data: {
      ...data,
      publishedAt,
      published: form.get("published") !== "false",
      imageData,
      mimeType: imageData ? "image/jpeg" : null,
    },
    omit: { imageData: true },
  });

  revalidateHome();
  return NextResponse.json(item, { status: 201 });
}
