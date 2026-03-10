/**
 * Game-modal variant footer: AI provider info and token usage.
 */

import type { AgentSelfStatusSnapshot } from "../../api-client";
import {
  estimateTokenCost,
  isNonChatModelLabel,
  resolveProviderLabel
} from "./conversation-utils";

interface GameModalFooterProps {
  selfStatus: AgentSelfStatusSnapshot | null;
  selfStatusLoading: boolean;
  agentStatusModel: string | undefined;
  chatLastUsage: {
    model?: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  } | null;
  t: (
    key: string,
    vars?: Record<string, string | number | boolean | null | undefined>,
  ) => string;
}

export function GameModalFooter({
  selfStatus,
  selfStatusLoading,
  agentStatusModel,
  chatLastUsage,
  t }: GameModalFooterProps) {
  const selfModelLabel = (selfStatus?.model ?? "").trim();
  const observedModelLabelRaw = (chatLastUsage?.model ?? "").trim();
  const observedModelLabel = isNonChatModelLabel(observedModelLabelRaw)
    ? ""
    : observedModelLabelRaw;
  const statusModelLabel = (agentStatusModel ?? "").trim();
  const configuredModelRaw = (selfModelLabel || statusModelLabel).trim();
  const configuredModelLabel = isNonChatModelLabel(configuredModelRaw)
    ? ""
    : configuredModelRaw;
  const modelLabel = (observedModelLabel || configuredModelLabel).trim();
  const modelProviderLabel = resolveProviderLabel(modelLabel);
  const providerLabel = modelProviderLabel
    ? modelProviderLabel
    : selfStatusLoading
      ? t("chat.modal.providerDetecting")
      : "N/A";

  const usageTotalLabel = chatLastUsage
    ? chatLastUsage.totalTokens.toLocaleString()
    : t("chat.modal.usageAwaiting");
  const usageBreakdownLabel = chatLastUsage
    ? `${chatLastUsage.promptTokens.toLocaleString()}\u2191 / ${chatLastUsage.completionTokens.toLocaleString()}\u2193`
    : "\u2014";
  const usageCostLabel = chatLastUsage
    ? estimateTokenCost(
      chatLastUsage.promptTokens,
      chatLastUsage.completionTokens,
      observedModelLabel || modelLabel,
    )
    : "\u2014";

  return (
    <div className="chat-game-sidebar-footer" data-testid="chat-game-provider">
      <div className="chat-game-sidebar-footer-label">
        {t("chat.modal.aiProvider")}
      </div>
      <div className="chat-game-sidebar-footer-value">{providerLabel}</div>
      <div
        className="chat-game-sidebar-footer-model"
        title={modelLabel || undefined}
      >
        {modelLabel || t("chat.modal.providerUnknown")}
      </div>
      <div className="chat-game-sidebar-usage">
        <div className="chat-game-sidebar-footer-label">
          {t("chat.modal.tokenUsage")}
        </div>
        <div className="chat-game-sidebar-usage-total">{usageTotalLabel}</div>
        <div className="chat-game-sidebar-usage-breakdown">
          {usageBreakdownLabel}
        </div>
        <div className="chat-game-sidebar-usage-cost">
          {t("chat.modal.estimatedCost")}: {usageCostLabel}
        </div>
      </div>
    </div>
  );
}
