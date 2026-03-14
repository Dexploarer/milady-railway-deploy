/**
 * Re-export from @milady/app-core/autonomy.
 * @deprecated Import directly from "@milady/app-core/autonomy" instead.
 */
export {
  type AutonomyEventStore,
  type AutonomyGapReplayRequest,
  type AutonomyRunHealth,
  type AutonomyRunHealthMap,
  type AutonomyRunHealthStatus,
  type MergeAutonomyEventsOptions,
  type MergeAutonomyEventsResult,
  buildAutonomyGapReplayRequests,
  hasPendingAutonomyGaps,
  markPendingAutonomyGapsPartial,
  mergeAutonomyEvents,
} from "@milady/app-core/autonomy";
