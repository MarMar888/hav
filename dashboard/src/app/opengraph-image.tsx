import { ImageResponse } from "next/og";

export const alt = "Project Hav: a 4-foot autonomous boat for the PEP27 Autonomy race";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, background: "linear-gradient(135deg, #09090b 0%, #052e2b 100%)", color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#10b981" }}>
          PEP27 WORKFORCE DEVELOPMENT COMPETITION · AUTONOMY
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 148, fontWeight: 700, letterSpacing: -4 }}>Project Hav</div>
          <div style={{ display: "flex", fontSize: 44, color: "#a1a1aa", marginTop: 8 }}>
            A 4-foot autonomous boat, built from the hull up.
          </div>
        </div>
        <div style={{ display: "flex", height: 8, width: 240, background: "#10b981", borderRadius: 4 }} />
      </div>
    ),
    size
  );
}
