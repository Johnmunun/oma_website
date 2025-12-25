/**
 * @file components/error-boundary-wrapper.tsx
 * @description Wrapper client pour ErrorBoundary dans le layout serveur
 */

"use client"

import ErrorBoundary from "./error-boundary"

export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}



