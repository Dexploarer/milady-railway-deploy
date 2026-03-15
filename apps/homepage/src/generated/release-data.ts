export const releaseData = {
  generatedAt: "2026-03-15T03:17:59.792Z",
  scripts: {
    shell: {
      url: "https://milady.ai/install.sh",
      command: "curl -fsSL https://milady.ai/install.sh | bash",
    },
    powershell: {
      url: "https://milady.ai/install.ps1",
      command: "irm https://milady.ai/install.ps1 | iex",
    },
  },
  release: {
    tagName: "v2.0.0-alpha.84",
    publishedAtLabel: "Mar 10, 2026",
    prerelease: true,
    url: "https://github.com/milady-ai/milady/releases/tag/v2.0.0-alpha.84",
    downloads: [
      {
        id: "macos-arm64",
        label: "macOS (Apple Silicon)",
        fileName: "canary-macos-arm64-Milady-canary.dmg",
        url: "https://github.com/milady-ai/milady/releases/download/v2.0.0-alpha.84/canary-macos-arm64-Milady-canary.dmg",
        sizeLabel: "702.3 MB",
        note: "DMG installer",
      },
      {
        id: "macos-x64",
        label: "macOS (Intel)",
        fileName: "canary-macos-x64-Milady-canary.dmg",
        url: "https://github.com/milady-ai/milady/releases/download/v2.0.0-alpha.84/canary-macos-x64-Milady-canary.dmg",
        sizeLabel: "712.2 MB",
        note: "DMG installer",
      },
      {
        id: "windows-x64",
        label: "Windows",
        fileName: "canary-win-x64-Milady-Setup-canary.zip",
        url: "https://github.com/milady-ai/milady/releases/download/v2.0.0-alpha.84/canary-win-x64-Milady-Setup-canary.zip",
        sizeLabel: "705.5 MB",
        note: "ZIP package",
      },
      {
        id: "linux-x64",
        label: "Linux",
        fileName: "canary-linux-x64-Milady-canary-Setup.tar.gz",
        url: "https://github.com/milady-ai/milady/releases/download/v2.0.0-alpha.84/canary-linux-x64-Milady-canary-Setup.tar.gz",
        sizeLabel: "601.0 MB",
        note: "tar.gz package",
      },
    ],
    checksum: {
      fileName: "SHA256SUMS.txt",
      url: "https://github.com/milady-ai/milady/releases/download/v2.0.0-alpha.84/SHA256SUMS.txt",
    },
  },
} as const;
