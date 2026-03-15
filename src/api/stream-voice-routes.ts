import {
  handleStreamVoiceRoute as handleAutonomousStreamVoiceRoute,
  onAgentMessage as onAutonomousAgentMessage,
} from "@milady/autonomous/api/stream-voice-routes";
import {
  getTtsProviderStatus,
  resolveTtsConfig,
  ttsStreamBridge,
} from "../services/tts-stream-bridge";
import { sanitizeSpeechText } from "../utils/spoken-text";
import {
  readStreamSettings,
  writeStreamSettings,
} from "./stream-persistence";
import type { StreamRouteState } from "./stream-route-state";
import type { IncomingMessage, ServerResponse } from "node:http";

export async function handleStreamVoiceRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  method: string,
  state: StreamRouteState,
): Promise<boolean> {
  return handleAutonomousStreamVoiceRoute({
    req,
    res,
    pathname,
    method,
    state,
    getTtsProviderStatus,
    resolveTtsConfig,
    ttsStreamBridge,
    sanitizeSpeechText,
    readStreamSettings,
    writeStreamSettings,
  });
}

export async function onAgentMessage(
  text: string,
  state: StreamRouteState,
): Promise<void> {
  return onAutonomousAgentMessage(text, state, {
    sanitizeSpeechText,
    readStreamSettings,
    resolveTtsConfig,
    ttsStreamBridge,
  });
}
