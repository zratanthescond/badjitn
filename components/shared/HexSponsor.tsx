import React from "react";
import { Card } from "@/components/ui/card";

export default function HexGridSponsor() {
  const cards = [
    { image: "/images/image1.jpg" },
    { image: "/images/image2.jpg" },
    { image: "/images/image3.jpg" },
    { image: "/images/image4.jpg" },
    { image: "/images/image5.jpg" },
    { image: "/images/image6.jpg" },
  ];

  const borderColors = [
    "#ef4444", // red
    "#3b82f6", // blue
    "#10b981", // green
    "#facc15", // yellow
    "#a855f7", // purple
    "#ec4899", // pink
  ];

  return (
    <div className="flex justify-center items-center   p-2">
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 hex-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="hexagon-border"
            style={{
              "--border-color": borderColors[index % borderColors.length],
            }}
          >
            <Card
              className="hexagon"
              style={{
                backgroundImage: `url(${card.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></Card>
          </div>
        ))}
      </div>

      <style>{`
        .hex-grid {
          display: grid;
          grid-template-rows: repeat(auto-fit, minmax(120px, 1fr));
          gap: 20px;
          place-items: center;
        }

        .hexagon-border {
          position: relative;
          width: 128px;
          height: 146px;
          background: var(--border-color);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .hexagon {
          width: 120px;
          height: 138px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: transform 0.2s, background 0.3s;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
          position: relative;
          background-size: cover;
          background-position: center;
        }

        .hexagon:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
