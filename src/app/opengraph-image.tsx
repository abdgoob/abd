import { ImageResponse } from "next/og";

export const alt = "Abdullah — Creative developer, frontend to backend";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fefefe",
          color: "#191711",
          padding: "48px",
          fontFamily: "Arial, sans-serif",
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
          <span>Abdullah</span>
          <span>Creative developer</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 138, fontWeight: 800, lineHeight: 0.82, letterSpacing: "-8px" }}>
          <span>Frontend</span>
          <span>To backend.</span>
        </div>
      </div>
    ),
    size,
  );
}