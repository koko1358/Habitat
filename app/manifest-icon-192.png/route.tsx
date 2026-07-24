import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c9793f",
          borderRadius: 36,
          fontSize: 112,
        }}
      >
        🌱
      </div>
    ),
    { width: 192, height: 192 }
  );
}
