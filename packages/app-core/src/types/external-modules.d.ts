declare module "@milady/capacitor-camera" {
  export type CameraPlugin = any;
  export const Camera: any;
}

declare module "@milady/capacitor-canvas" {
  export type CanvasPlugin = any;
  export const Canvas: any;
}

declare module "@milady/capacitor-desktop" {
  export type DesktopPlugin = any;
  export const Desktop: any;
}

declare module "@milady/capacitor-gateway" {
  export type GatewayPlugin = any;
  export const Gateway: any;
}

declare module "@milady/capacitor-location" {
  export type LocationPlugin = any;
  export const Location: any;
}

declare module "@milady/capacitor-screencapture" {
  export type ScreenCapturePlugin = any;
  export const ScreenCapture: any;
}

declare module "@milady/capacitor-swabble" {
  export interface SwabbleConfig {
    triggers?: string[];
    minPostTriggerGap?: number;
    modelSize?: "tiny" | "base" | "small" | "medium" | "large";
  }

  export type SwabblePlugin = any;
  export const Swabble: any;
}

declare module "@milady/capacitor-talkmode" {
  export type TalkModePlugin = any;
  export const TalkMode: any;
}
