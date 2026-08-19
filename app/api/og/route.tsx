import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawTitle = searchParams.get("title") || "Badgi.net - Discover & Manage Events";
    const rawDescription =
      searchParams.get("description") ||
      "All-in-one platform for event management, ticketing, badge generation, and discovery.";
    const category = searchParams.get("category") || "Events";
    const date = searchParams.get("date") || "";
    const type = searchParams.get("type") || "event";

    // Clean and trim text for Satori SVG renderer
    const title = rawTitle.length > 75 ? `${rawTitle.slice(0, 75)}...` : rawTitle;
    const description = rawDescription.length > 130 ? `${rawDescription.slice(0, 130)}...` : rawDescription;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#090d16",
            padding: "50px 70px",
            color: "#ffffff",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                B
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                Badgi.net
              </div>
            </div>

            {category ? (
              <div
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  backgroundColor: "#2e1065",
                  border: "1px solid #7c3aed",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#c4b5fd",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {category}
              </div>
            ) : null}
          </div>

          {/* Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: title.length > 45 ? "44px" : "54px",
                fontWeight: 900,
                lineHeight: 1.2,
                color: "#ffffff",
                letterSpacing: "-1px",
              }}
            >
              {title}
            </div>

            {description ? (
              <div
                style={{
                  fontSize: "22px",
                  color: "#94a3b8",
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #1e293b",
              paddingTop: "20px",
              fontSize: "18px",
              color: "#94a3b8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {date ? (
                <div style={{ display: "flex", color: "#e2e8f0" }}>
                  📅 {date}
                </div>
              ) : null}
              <div style={{ display: "flex", color: "#a855f7" }}>
                ✨ {type === "event" ? "Live Event" : "Platform"}
              </div>
            </div>

            <div style={{ display: "flex", color: "#64748b", fontWeight: 600 }}>
              badgi.net
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, immutable, no-transform, max-age=86400",
        },
      }
    );
  } catch (e: any) {
    console.error("OG Image generation error:", e);
    // Minimal fallback SVG/PNG
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#090d16",
            color: "#ffffff",
            fontSize: "48px",
            fontWeight: 800,
          }}
        >
          Badgi.net - Events & Ticketing
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
