/**
 * Loading component for displaying during page and data loading
 * 
 * This component is rendered by Next.js while the page or its data
 * dependencies are loading.
 * 
 * @module loading
 */

/**
 * Loading component with a simple message
 * 
 * @returns Loading UI to be shown during loading states
 */
export default function Loading() {
  return (
    <div className="loading">
      <p>Loading weather data...</p>
    </div>
  );
}
