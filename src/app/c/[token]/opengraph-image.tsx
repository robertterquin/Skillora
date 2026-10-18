import { ImageResponse } from "next/og";
import { getPublicCertificate } from "@/lib/public-certificate";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Skillora certificate of mastery";

/** Link-preview image for a shared certificate. */
export default async function Image({ params }: { params: { token: string } }) {
  const cert = await getPublicCertificate(params.token);
  const name = cert?.name ?? "Skillora";
  const skill = cert?.skill.title ?? "Certificate of mastery";
  const date = cert
    ? new Date(cert.certifiedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#F7F5F0",
          color: "#1A1917",
          border: "16px double #E6D8B5",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#625D55" }}>
          <span style={{ fontWeight: 700, color: "#1A1917" }}>Skillora</span>
          <span>Certificate of mastery</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 36, color: "#625D55" }}>{name}</span>
          <span style={{ fontSize: 72, fontStyle: "italic", lineHeight: 1.1, marginTop: 12 }}>{skill}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#2D5A43" }}>
          <span>✓ Verified by Skillora</span>
          <span style={{ color: "#625D55" }}>{date}</span>
        </div>
      </div>
    ),
    size
  );
}
