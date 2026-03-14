/**
 * Re-export from @milady/app-core/chat.
 * @deprecated Import directly from "@milady/app-core/chat" instead.
 */
export {
  type SavedCustomCommand,
  CUSTOM_COMMANDS_STORAGE_KEY,
  loadSavedCustomCommands,
  saveSavedCustomCommands,
  appendSavedCustomCommand,
  normalizeSlashCommandName,
  expandSavedCustomCommand,
  splitCommandArgs,
} from "@milady/app-core/chat";
