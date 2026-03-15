import type { UiLanguage } from "@milady/app-core/i18n";
import type { UiTheme } from "@milady/app-core/state";
import { memo } from "react";
import { ShellHeaderControls } from "../shared/ShellHeaderControls";

export interface CompanionHeaderProps {
  shellMode: "companion" | "native";
  onShellModeChange: (mode: "companion" | "native") => void;
  uiLanguage: UiLanguage;
  setUiLanguage: (language: UiLanguage) => void;
  uiTheme: UiTheme;
  setUiTheme: (theme: UiTheme) => void;
  t: (key: string) => string;
}

export const CompanionHeader = memo(function CompanionHeader(
  props: CompanionHeaderProps,
) {
  const {
    shellMode,
    onShellModeChange,
    uiLanguage,
    setUiLanguage,
    uiTheme,
    setUiTheme,
    t,
  } = props;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10">
      <ShellHeaderControls
        shellMode={shellMode}
        onShellModeChange={onShellModeChange}
        uiLanguage={uiLanguage}
        setUiLanguage={setUiLanguage}
        uiTheme={uiTheme}
        setUiTheme={setUiTheme}
        t={t}
        className="pointer-events-auto px-3 py-2 sm:px-4 sm:py-3"
      />
    </header>
  );
});
