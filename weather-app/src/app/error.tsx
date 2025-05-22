"use client";

/**
 * Error component for handling and displaying runtime errors
 * 
 * Provides a simple error display with error message and reset functionality
 * to allow users to recover from errors without refreshing the page.
 * 
 * @module error
 */
import { ErrorProps } from "@/lib/types";
import { useEffect } from "react";

/**
 * Error component for displaying runtime errors
 * 
 * Logs the error to console and provides a UI for recovery
 * 
 * @param error - The error object that was thrown
 * @param reset - Function to reset the error boundary and retry rendering
 */
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
