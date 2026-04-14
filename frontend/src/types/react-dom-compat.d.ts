declare module "react-dom/client" {
  import type * as React from "react";

  export interface ErrorInfo {
    componentStack?: string;
  }

  export interface RootOptions {
    identifierPrefix?: string;
    onCaughtError?:
      | ((
          error: unknown,
          errorInfo: {
            componentStack?: string | undefined;
            errorBoundary?: React.Component<unknown> | undefined;
          },
        ) => void)
      | undefined;
    onRecoverableError?:
      | ((error: unknown, errorInfo: ErrorInfo) => void)
      | undefined;
    onUncaughtError?:
      | ((
          error: unknown,
          errorInfo: { componentStack?: string | undefined },
        ) => void)
      | undefined;
  }

  export type Container = Element | Document | DocumentFragment;

  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }

  export function createRoot(container: Container, options?: RootOptions): Root;

  export function hydrateRoot(
    container: Element | Document,
    initialChildren: React.ReactNode,
    options?: RootOptions,
  ): Root;
}

declare module "react-dom/test-utils" {
  export { act } from "react";
}
