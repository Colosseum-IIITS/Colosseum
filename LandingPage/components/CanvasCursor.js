"use client";

import { useEffect, useState } from "react";
import useCanvasCursor from "@/hooks/use-canvasCursor";

const CanvasCursor = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Always call useCanvasCursor hook first, regardless of mounted state
  useCanvasCursor();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return null during server-side rendering
  if (!isMounted) {
    return null;
  }

  return (
    <canvas
      className="pointer-events-none fixed inset-0"
      id="canvas"
      style={{
        zIndex: 9999,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default CanvasCursor;
