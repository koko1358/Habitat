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
          borderRadius: 96,
          fontSize: 300,
        }}
      >
        🌱
      </div>
    ),
    { width: 512, height: 512 }
  );
}
