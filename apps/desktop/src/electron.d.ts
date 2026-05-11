import type { DetailedHTMLProps, HTMLAttributes } from "react";

export interface WindowEncryptBridge {
  platform: NodeJS.Platform;
  loadState: () => Promise<string | null>;
  saveState: (state: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  onShortcut: (listener: (command: string) => void) => () => void;
  onBrowserAction: (listener: (payload: { action: string; url: string; title: string }) => void) => () => void;
}

declare global {
  interface Window {
    encrypt: WindowEncryptBridge;
  }

  namespace JSX {
    interface IntrinsicElements {
      webview: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        allowpopups?: boolean;
        partition?: string;
        preload?: string;
        src?: string;
      };
    }
  }
}

export {};