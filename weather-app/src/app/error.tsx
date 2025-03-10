"use client";

import { ErrorProps } from "@/lib/types";
import { useEffect } from "react";

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(`Ran into the following error: ${error}`);
  }, [error]);

  return (
    <div>
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
