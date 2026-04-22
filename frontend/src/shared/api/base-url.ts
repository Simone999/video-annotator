type FrontendEnv = {
  readonly VITE_API_BASE_URL?: string;
};

function readDefaultApiBaseUrl(env: FrontendEnv): string {
  const configuredApiBaseUrl = env.VITE_API_BASE_URL;
  return typeof configuredApiBaseUrl === "string" &&
    configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl
    : "/api";
}

export const DEFAULT_API_BASE_URL: string = readDefaultApiBaseUrl(
  import.meta.env as FrontendEnv,
);
