import { LanguageDropdown, ThemeToggle } from "@milady/app-core/components";
import type { UiLanguage } from "@milady/app-core/i18n";
import type { UiShellMode, UiTheme } from "@milady/app-core/state";
import { CircleUserRound, Monitor } from "lucide-react";
import type { ReactNode } from "react";

export const HEADER_ICON_BUTTON_CLASSNAME =
  "inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] border border-border/50 bg-bg/50 backdrop-blur-md cursor-pointer text-sm leading-none hover:border-accent hover:text-txt font-medium hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(var(--accent),0.5)] active:scale-95 rounded-xl text-txt shadow-sm";

type ShellHeaderTranslator = (key: string) => string;

interface ShellHeaderControlsProps {
  shellMode: UiShellMode | null | undefined;
  onShellModeChange: (mode: UiShellMode) => void;
  uiLanguage: UiLanguage;
  setUiLanguage: (language: UiLanguage) => void;
  uiTheme: UiTheme;
  setUiTheme: (theme: UiTheme) => void;
  t: ShellHeaderTranslator;
  children?: ReactNode;
  rightExtras?: ReactNode;
  className?: string;
  controlsVariant?: "native" | "companion";
}

export function ShellHeaderControls({
  shellMode,
  onShellModeChange,
  uiLanguage,
  setUiLanguage,
  uiTheme,
  setUiTheme,
  t,
  children,
  rightExtras,
  className,
  controlsVariant = "native",
}: ShellHeaderControlsProps) {
  const activeShellMode = shellMode ?? "companion";
  const shellOptions: Array<{
    mode: UiShellMode;
    label: string;
    Icon: typeof CircleUserRound;
  }> = [
    {
      mode: "companion",
      label: t("header.companionMode"),
      Icon: CircleUserRound,
    },
    {
      mode: "native",
      label: t("header.nativeMode"),
      Icon: Monitor,
    },
  ];

  return (
    <div
      className={`flex min-w-0 items-center gap-3 w-full ${className ?? ""}`}
    >
      <div className="flex shrink-0 items-center">
        <fieldset
          className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/70 p-1 shadow-[0_10px_24px_rgba(15,23,42,0.16)] backdrop-blur-md dark:border-white/12 dark:bg-white/10"
          data-testid="ui-shell-toggle"
          aria-label={t("header.switchToNative")}
        >
          <legend className="sr-only">{t("header.switchToNative")}</legend>
          {shellOptions.map(({ mode, label, Icon }, index) => {
            const selected = activeShellMode === mode;
            const segmentShapeClass =
              index === 0
                ? "rounded-l-full rounded-r-md"
                : "rounded-l-md rounded-r-full";
            return (
              <button
                key={mode}
                type="button"
                onClick={() => onShellModeChange(mode)}
                className={`inline-flex h-9 min-w-[44px] items-center justify-center px-3 transition-all duration-200 ${segmentShapeClass} ${
                  selected
                    ? "border border-[#f0b232]/45 bg-white/95 text-[#f0b232] shadow-[0_0_18px_rgba(240,178,50,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] dark:bg-white/14 dark:text-[#f0b232] dark:border-[#f0b232]/35"
                    : "border border-transparent bg-transparent text-[#d4a11e]/80 hover:bg-white/65 hover:text-[#f0b232] dark:text-[#f0b232]/70 dark:hover:bg-white/10 dark:hover:text-[#f0b232]"
                }`}
                aria-label={label}
                aria-pressed={selected}
                title={label}
                data-testid={`ui-shell-toggle-${mode}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </fieldset>
      </div>

      <div className="min-w-0 flex-1">{children}</div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {rightExtras}
        <LanguageDropdown
          uiLanguage={uiLanguage}
          setUiLanguage={setUiLanguage}
          t={t}
          variant={controlsVariant}
        />
        <ThemeToggle
          uiTheme={uiTheme}
          setUiTheme={setUiTheme}
          t={t}
          variant={controlsVariant}
        />
      </div>
    </div>
  );
}
