import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17130f",
          borderRadius: 6,
        }}
      >
        <svg width="22" height="14" viewBox="0 0 220 140" fill="none">
          <path
            d="M10 120 L60 50 L90 80 L130 25 L170 90 L210 45 L210 120 Z"
            fill="none"
            stroke="#f7efe4"
            strokeWidth="12"
            strokeLinejoin="round"
          />
          <path d="M130 25 L170 90 L148 76 Z" fill="#ef7d1f" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
