declare module "@pagefind/default-ui" {
  export type PagefindUIOptions = {
    element?: HTMLElement | string;
    bundlePath?: string;
    pageSize?: number;
    resetStyles?: boolean;
    showImages?: boolean;
    showSubResults?: boolean;
    excerptLength?: number;
    debounceTimeoutMs?: number;
    autofocus?: boolean;
    [key: string]: unknown;
  };

  export class PagefindUI {
    constructor(opts: PagefindUIOptions);
    destroy(): void;
    triggerSearch(term: string): void;
  }
}
