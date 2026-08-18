import React from "react";

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * Reusable component to safely render JSON-LD structured data into the HTML
 */
export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
