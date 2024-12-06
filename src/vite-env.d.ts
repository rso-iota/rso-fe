/// <reference types="vite/client" />
//
interface ImportMetaEnv {
  readonly VITE_BACKEND_API: string;
  readonly VITE_KC_AUTHORITY: string;
  readonly VITE_KC_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
