import { ImageResponse } from "next/og";

export const alt = "MTQARAN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #17130f 0%, #2a2018 100%)",
        }}
      >
        <svg width="220" height="120" viewBox="0 0 220 120" fill="none">
          <path
            d="M10 100 L60 40 L90 70 L130 20 L170 80 L210 40 L210 100 Z"
            fill="none"
            stroke="#f7efe4"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M130 20 L170 80 L150 68 Z" fill="#ef7d1f" />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: 6,
            color: "#f7efe4",
          }}
        >
          MTQARAN
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 3,
            color: "#ef7d1f",
            textTransform: "uppercase",
          }}
        >
          Academy · Villages Fund
        </div>
      </div>
    ),
    { ...size }
  );
}
