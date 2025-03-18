"use client";

import { useEffect, useState } from "react";
import useCanvasCursor from "@/hooks/use-canvasCursor";

const CanvasCursor = () => {
  // Use state to track client-side rendering
  const [isMounted, setIsMounted] = useState(false);

  // Only run the cursor effect after component has mounted on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only use the canvas cursor hook when the component is mounted on the client
  if (isMounted) {
    useCanvasCursor();
  }

  // Return null during server-side rendering to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

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
