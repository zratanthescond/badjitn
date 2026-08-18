import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Badgi.net - Discover & Manage Events";
    const description =
      searchParams.get("description") ||
      "All-in-one platform for event management, ticketing, badge generation, and discovery.";
    const category = searchParams.get("category") || "Events";
    const date = searchParams.get("date") || "";
    const type = searchParams.get("type") || "event";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#0b0f19",
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
            padding: "60px 80px",
            fontFamily: "sans-serif",
            color: "#ffffff",
          }}
        >
          {/* Header Brand */}
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
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: "bold",
                }}
              >
                B
              </div>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                  background: "linear-gradient(to right, #ffffff, #cbd5e1)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Badgi.net
              </span>
            </div>

            {category && (
              <div
                style={{
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(124, 58, 237, 0.3)",
                  border: "1px solid rgba(139, 92, 246, 0.4)",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#c4b5fd",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {category}
              </div>
            )}
          </div>

          {/* Main Title & Description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                fontSize: title.length > 50 ? "46px" : "56px",
                fontWeight: "900",
                lineHeight: 1.15,
                color: "#ffffff",
                letterSpacing: "-1px",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: "22px",
                color: "#94a3b8",
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {description}
            </div>
          </div>

          {/* Footer with meta badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
              fontSize: "18px",
              color: "#94a3b8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              {date && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e2e8f0" }}>
                  <span>📅</span> {date}
                </div>
              )}
              <div style={{ color: "#a855f7" }}>
                ✨ {type === "event" ? "Live Event" : "Platform"}
              </div>
            </div>

            <div style={{ color: "#64748b", fontWeight: "500" }}>
              badgi.net
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
