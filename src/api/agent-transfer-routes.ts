import {
  AgentExportError,
  estimateExportSize,
  exportAgent,
  importAgent,
} from "../services/agent-export";
import {
  handleAgentTransferRoutes as handleAutonomousAgentTransferRoutes,
  type AgentTransferRouteContext as AutonomousAgentTransferRouteContext,
  type AgentTransferRouteState,
} from "@milady/autonomous/api/agent-transfer-routes";
import type { RouteRequestContext } from "./route-helpers";

export type { AgentTransferRouteState };

export interface AgentTransferRouteContext extends RouteRequestContext {
  state: AgentTransferRouteState;
}

function toAutonomousContext(
  ctx: AgentTransferRouteContext,
): AutonomousAgentTransferRouteContext {
  return {
    ...ctx,
    exportAgent,
    estimateExportSize,
    importAgent,
    isAgentExportError: (error: unknown) => error instanceof AgentExportError,
  };
}

export async function handleAgentTransferRoutes(
  ctx: AgentTransferRouteContext,
): Promise<boolean> {
  return handleAutonomousAgentTransferRoutes(toAutonomousContext(ctx));
}
