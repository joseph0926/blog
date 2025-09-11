export {};

declare global {
  interface Window {
    __RUM_INITIALIZED?: boolean;
  }
}
