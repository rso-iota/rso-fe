/// <reference types="vite/client" />
//
interface ImportMetaEnv {
  readonly VITE_BACKEND_API: string;
  readonly VITE_KC_AUTHORITY: string;
  readonly VITE_KC_CLIENT_ID: string;
  readonly VITE_DISCORD_WEBHOOK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
