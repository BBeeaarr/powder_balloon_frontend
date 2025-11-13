declare module "*.png" {
  const url: string;
  export default url;
}

// Vite environment variables typing
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
