import { Button, Textarea } from "@milady/ui";
import { Mic, Paperclip, Send, Square } from "lucide-react";
import type { KeyboardEvent, RefObject } from "react";

type ChatComposerVariant = "default" | "game-modal";

interface ChatComposerVoiceState {
  supported: boolean;
  isListening: boolean;
  interimTranscript: string;
  isSpeaking: boolean;
  toggleListening: () => void;
}

interface ChatComposerProps {
  variant: ChatComposerVariant;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  chatInput: string;
  chatPendingImagesCount: number;
  isComposerLocked: boolean;
  isAgentStarting: boolean;
  chatSending: boolean;
  voice: ChatComposerVoiceState;
  t: (key: string) => string;
  onAttachImage: () => void;
  onChatInputChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onStop: () => void;
  onStopSpeaking: () => void;
}

const COMPOSER_CONTROL_HEIGHT_CLASSNAME = "h-[46px]";
const COMPOSER_ICON_BUTTON_CLASSNAME = `${COMPOSER_CONTROL_HEIGHT_CLASSNAME} w-[46px] shrink-0`;
const COMPOSER_ACTION_BUTTON_CLASSNAME = `ml-1 flex items-center justify-center rounded-full transition-all ${COMPOSER_ICON_BUTTON_CLASSNAME}`;
const COMMON_TEXTAREA_CLASSNAME = `w-full min-w-0 min-h-0 ${COMPOSER_CONTROL_HEIGHT_CLASSNAME} resize-none overflow-y-hidden max-h-[200px] outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 font-[var(--font-chat)] disabled:opacity-50`;

export function ChatComposer({
  variant,
  textareaRef,
  chatInput,
  chatPendingImagesCount,
  isComposerLocked,
  isAgentStarting,
  chatSending,
  voice,
  t,
  onAttachImage,
  onChatInputChange,
  onKeyDown,
  onSend,
  onStop,
  onStopSpeaking,
}: ChatComposerProps) {
  const isGameModal = variant === "game-modal";
  const showVoiceButton = isGameModal || voice.supported;
  const showListeningTranscript =
    voice.isListening && !!voice.interimTranscript;
  const actionButtonTitle = chatSending
    ? t("chat.stopGeneration")
    : isGameModal || !voice.isSpeaking
      ? isAgentStarting
        ? t("chat.agentStarting")
        : t("chat.send")
      : t("chat.stopSpeaking");
  const actionButtonLabel = isGameModal ? undefined : actionButtonTitle;

  return (
    <div
      className={
        isGameModal
          ? "relative flex items-end gap-1 transition-all"
          : "flex items-end gap-1.5 sm:gap-2"
      }
    >
      {!isGameModal && (
        <Button
          variant={chatPendingImagesCount > 0 ? "secondary" : "ghost"}
          size="icon"
          className={`${COMPOSER_ICON_BUTTON_CLASSNAME} ${
            chatPendingImagesCount > 0
              ? "bg-accent/10 sm:hover:bg-accent/20 border-accent/20 text-txt/80 hover:text-txt shadow-sm"
              : "text-muted hover:bg-black/5 hover:text-txt"
          }`}
          onClick={onAttachImage}
          aria-label="Attach image"
          title={t("chatview.AttachImage")}
          disabled={isComposerLocked}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      )}

      {showVoiceButton && (
        <Button
          variant={
            isGameModal ? "ghost" : voice.isListening ? "default" : "ghost"
          }
          size="icon"
          className={
            isGameModal
              ? `flex items-center justify-center rounded-full transition-all ${COMPOSER_ICON_BUTTON_CLASSNAME} ${
                  voice.isListening
                    ? "bg-accent/20 text-txt"
                    : "bg-transparent text-white/50 hover:bg-white/10 hover:text-white"
                } ${isComposerLocked ? "opacity-50" : ""}`
              : `${COMPOSER_ICON_BUTTON_CLASSNAME} ${
                  voice.isListening
                    ? "bg-accent shadow-[0_0_10px_rgba(124,58,237,0.4)] animate-pulse"
                    : "text-muted hover:bg-black/5 hover:text-txt"
                }`
          }
          onClick={voice.toggleListening}
          aria-label={
            isAgentStarting
              ? t("chat.agentStarting")
              : voice.isListening
                ? t("chat.stopListening")
                : t("chat.voiceInput")
          }
          aria-pressed={isGameModal ? undefined : voice.isListening}
          title={
            isAgentStarting
              ? t("chat.agentStarting")
              : voice.isListening
                ? t("chat.stopListening")
                : t("chat.voiceInput")
          }
          disabled={isComposerLocked}
        >
          <Mic
            className={`${
              isGameModal ? "w-5 h-5" : "w-4 h-4"
            } ${voice.isListening ? (isGameModal ? "animate-pulse" : "fill-current") : ""}`}
          />
        </Button>
      )}

      {showListeningTranscript ? (
        <div
          className={
            isGameModal
              ? "flex h-[46px] flex-1 items-center rounded-2xl bg-black/40 px-4 py-2 text-[15px] leading-relaxed text-white/80 italic min-w-0"
              : "flex h-[46px] flex-1 items-center rounded-md border border-accent bg-card px-3 py-2 text-[15px] leading-[1.7] text-txt min-w-0"
          }
          style={{ fontFamily: "var(--font-chat)" }}
        >
          {isGameModal ? (
            voice.interimTranscript
          ) : (
            <span className="text-muted italic">{voice.interimTranscript}</span>
          )}
        </div>
      ) : (
        <div
          className={
            isGameModal
              ? "flex min-h-[46px] flex-1 items-center rounded-2xl bg-black/40 transition-all min-w-0"
              : "flex min-h-[46px] flex-1 items-center rounded-md border border-border/40 bg-card/60 backdrop-blur-md min-w-0"
          }
        >
          <Textarea
            ref={textareaRef}
            data-testid="chat-composer-textarea"
            className={
              isGameModal
                ? `${COMMON_TEXTAREA_CLASSNAME} px-4 py-2 bg-transparent border-none text-[15px] leading-relaxed text-white placeholder:text-white/30 max-h-[150px]`
                : `${COMMON_TEXTAREA_CLASSNAME} px-3 py-2 bg-transparent border-none text-[15px] leading-[1.7] text-txt placeholder:text-muted`
            }
            style={{ fontFamily: "var(--font-chat)" }}
            rows={1}
            aria-label="Chat message"
            placeholder={
              isAgentStarting
                ? t("chat.agentStarting")
                : !isGameModal && voice.isListening
                  ? t("chat.listening")
                  : t("chat.inputPlaceholder")
            }
            value={chatInput}
            onChange={(event) => onChatInputChange(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={isComposerLocked}
          />
        </div>
      )}

      {chatSending ? (
        <Button
          variant="destructive"
          data-testid="chat-composer-action"
          className={`${COMPOSER_ACTION_BUTTON_CLASSNAME} bg-danger/20 text-danger hover:bg-danger/30`}
          onClick={onStop}
          size="icon"
          title={actionButtonLabel}
          aria-label={actionButtonLabel}
        >
          <Square className="w-4 h-4 fill-current" />
        </Button>
      ) : !isGameModal && voice.isSpeaking ? (
        <Button
          variant="destructive"
          data-testid="chat-composer-action"
          className={`${COMPOSER_ACTION_BUTTON_CLASSNAME} bg-danger/20 text-danger hover:bg-danger/30`}
          onClick={onStopSpeaking}
          size="icon"
          title={actionButtonLabel}
          aria-label={actionButtonLabel}
        >
          <Square className="w-4 h-4 fill-current" />
        </Button>
      ) : (
        <Button
          variant="default"
          data-testid="chat-composer-action"
          size="icon"
          className={`${COMPOSER_ACTION_BUTTON_CLASSNAME} bg-accent text-accent-fg hover:shadow-[0_0_15px_rgba(240,178,50,0.4)] disabled:opacity-40`}
          onClick={onSend}
          disabled={isComposerLocked || !chatInput.trim()}
          aria-label={actionButtonLabel}
          title={actionButtonLabel}
        >
          <Send className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
