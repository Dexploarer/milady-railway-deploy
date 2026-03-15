import {
  handleMemoryRoutes as handleAutonomousMemoryRoutes,
} from "@milady/autonomous/api/memory-routes";
import type { RouteRequestContext } from "./route-helpers";
import type { AgentRuntime } from "@elizaos/core";

export interface MemoryRouteContext extends RouteRequestContext {
  url: URL;
  runtime: AgentRuntime | null;
  agentName: string;
}

export async function handleMemoryRoutes(
  ctx: MemoryRouteContext,
): Promise<boolean> {
  return handleAutonomousMemoryRoutes(ctx);
}
