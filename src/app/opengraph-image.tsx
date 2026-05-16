import { ImageResponse } from "next/og";

export const alt = "DSA Prep — topicwise LeetCode & ratingwise Codeforces";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -3,
          }}
        >
          DP
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 800, lineHeight: 1.05 }}>
            DSA Prep
          </div>
          <div style={{ fontSize: 36, color: "#cbd5e1", lineHeight: 1.3 }}>
            Topicwise LeetCode + ratingwise Codeforces. Track streaks, follow
            Striver / NeetCode sheets.
          </div>
        </div>
      </div>
    ),
    size
  );
}
