"use client";

import useCanvasCursor from "@/hooks/use-canvasCursor";

const CanvasCursor = () => {
  useCanvasCursor();

  return (
    <canvas
      className="pointer-events-none fixed inset-0"
      id="canvas"
      style={{
        zIndex: 9999,  // Ensure the canvas is on top
        position: "fixed", // Ensures it's fixed in the viewport
        top: 0,
        left: 0,
      }}
    />
  );
};

export default CanvasCursor;
