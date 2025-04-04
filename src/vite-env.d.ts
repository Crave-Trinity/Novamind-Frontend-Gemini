/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables
 * This extends the ImportMeta interface to include Vite-specific properties
 */
interface ImportMetaEnv {
  readonly VITE_AUDIT_LOG_API_URL: string;
  readonly VITE_API_URL: string;
  readonly MODE: "development" | "production" | "test";
  // Add any other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
