'use client';

import { SaveLog } from "@/firebase/logs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your service
    SaveLog({ 
      error: error.message, 
      errorInfo: error.stack ?? '' 
    });
  }, [error]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Oops, there is an error!</h2>
      <div className="bg-red-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Error Message:</h3>
        <p className="text-red-700">{error.message}</p>
      </div>
      {error.stack && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Error Stack:</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{error.stack}</pre>
        </div>
      )}
      <button
        type="button"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        onClick={reset}
      >
        Try again?
      </button>
    </div>
  );
} 