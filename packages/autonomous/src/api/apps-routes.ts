import type { RouteHelpers, RouteRequestMeta } from "./route-helpers";

export interface RegistryPluginInfo {
  gitRepo: string;
  gitUrl: string;
  description: string;
  topics: string[];
  stars: number;
  language: string;
  kind?: string;
  name: string;
  displayName?: string;
  homepage?: string | null;
  launchType?: string;
  launchUrl?: string | null;
  viewer?: {
    url: string;
    embedParams?: Record<string, string>;
    postMessageAuth?: boolean;
    sandbox?: string;
  };
  uiExtension?: {
    detailPanelId: string;
  };
  appMeta?: {
    displayName?: string;
    category?: string;
    launchType?: string;
    launchUrl?: string | null;
    icon?: string | null;
    capabilities?: string[];
    uiExtension?: {
      detailPanelId: string;
    };
    viewer?: {
      url: string;
      embedParams?: Record<string, string>;
      postMessageAuth?: boolean;
      sandbox?: string;
    };
  };
  npm: {
    package: string;
    v0Version?: string | null;
    v1Version?: string | null;
    v2Version?: string | null;
  };
  supports: {
    v0: boolean;
    v1: boolean;
    v2: boolean;
  };
  category?: string;
  capabilities?: string[];
  icon?: string | null;
}

export interface RegistrySearchResult {
  name: string;
  description: string;
  score: number;
  tags: string[];
  version: string | null;
  latestVersion?: string | null;
  npmPackage: string;
  repository: string;
  stars: number;
  supports: {
    v0: boolean;
    v1: boolean;
    v2: boolean;
  };
}

export interface InstallProgressLike {
  phase: string;
  message: string;
  pluginName?: string;
}

export interface PluginManagerLike {
  listInstalledPlugins: () => Promise<
    Array<{
      name: string;
      version?: string;
      installedAt?: string;
    }>
  >;
  getRegistryPlugin: (name: string) => Promise<RegistryPluginInfo | null>;
  refreshRegistry: () => Promise<Map<string, RegistryPluginInfo>>;
  searchRegistry: (
    query: string,
    limit?: number,
  ) => Promise<RegistrySearchResult[]>;
  installPlugin: (
    pluginName: string,
    onProgress?: (progress: InstallProgressLike) => void,
  ) => Promise<{
    success: boolean;
    pluginName: string;
    version: string;
    installPath: string;
    requiresRestart: boolean;
    error?: string;
  }>;
  uninstallPlugin: (pluginName: string) => Promise<{
    success: boolean;
    pluginName: string;
    requiresRestart: boolean;
    error?: string;
  }>;
  listEjectedPlugins: () => Promise<
    Array<{
      name: string;
      version?: string;
      installedAt?: string;
    }>
  >;
  ejectPlugin: (pluginName: string) => Promise<{
    success: boolean;
    pluginName: string;
    ejectedPath: string;
    requiresRestart: boolean;
    error?: string;
  }>;
  syncPlugin: (pluginName: string) => Promise<{
    success: boolean;
    pluginName: string;
    ejectedPath: string;
    requiresRestart: boolean;
    error?: string;
  }>;
  reinjectPlugin: (pluginName: string) => Promise<{
    success: boolean;
    pluginName: string;
    removedPath: string;
    requiresRestart: boolean;
    error?: string;
  }>;
}

export interface AppManagerLike {
  listAvailable: (pluginManager: PluginManagerLike) => Promise<unknown>;
  search: (
    pluginManager: PluginManagerLike,
    query: string,
    limit?: number,
  ) => Promise<unknown>;
  listInstalled: (pluginManager: PluginManagerLike) => Promise<unknown>;
  launch: (
    pluginManager: PluginManagerLike,
    name: string,
    onProgress?: (progress: InstallProgressLike) => void,
    runtime?: unknown | null,
  ) => Promise<unknown>;
  stop: (pluginManager: PluginManagerLike, name: string) => Promise<unknown>;
  getInfo: (
    pluginManager: PluginManagerLike,
    name: string,
  ) => Promise<unknown>;
}

export interface AppsRouteContext
  extends RouteRequestMeta,
    Pick<RouteHelpers, "readJsonBody" | "json" | "error"> {
  url: URL;
  appManager: AppManagerLike;
  getPluginManager: () => PluginManagerLike;
  parseBoundedLimit: (rawLimit: string | null, fallback?: number) => number;
  runtime: unknown | null;
}

function isNonAppRegistryPlugin(plugin: RegistryPluginInfo): boolean {
  if (plugin.kind === "app") return false;
  const name = plugin.name.toLowerCase();
  const npmPackage = plugin.npm.package.toLowerCase();
  return !name.includes("/app-") && !npmPackage.includes("/app-");
}

function isNonAppSearchResult(plugin: RegistrySearchResult): boolean {
  const name = plugin.name.toLowerCase();
  const npmPackage = plugin.npmPackage.toLowerCase();
  return !name.includes("/app-") && !npmPackage.includes("/app-");
}

export async function handleAppsRoutes(
  ctx: AppsRouteContext,
): Promise<boolean> {
  const {
    req,
    res,
    method,
    pathname,
    url,
    appManager,
    getPluginManager,
    parseBoundedLimit,
    readJsonBody,
    json,
    error,
    runtime,
  } = ctx;

  if (method === "GET" && pathname === "/api/apps") {
    const pluginManager = getPluginManager();
    const apps = await appManager.listAvailable(pluginManager);
    json(res, apps as object);
    return true;
  }

  if (method === "GET" && pathname === "/api/apps/search") {
    const query = url.searchParams.get("q") ?? "";
    if (!query.trim()) {
      json(res, []);
      return true;
    }
    const limit = parseBoundedLimit(url.searchParams.get("limit"));
    const pluginManager = getPluginManager();
    const results = await appManager.search(pluginManager, query, limit);
    json(res, results as object);
    return true;
  }

  if (method === "GET" && pathname === "/api/apps/installed") {
    const pluginManager = getPluginManager();
    const installed = await appManager.listInstalled(pluginManager);
    json(res, installed as object);
    return true;
  }

  if (method === "POST" && pathname === "/api/apps/launch") {
    try {
      const body = await readJsonBody<{ name?: string }>(req, res);
      if (!body) return true;
      if (!body.name?.trim()) {
        error(res, "name is required");
        return true;
      }
      const pluginManager = getPluginManager();
      const result = await appManager.launch(
        pluginManager,
        body.name.trim(),
        (_progress: InstallProgressLike) => {},
        runtime,
      );
      json(res, result as object);
    } catch (e) {
      error(res, e instanceof Error ? e.message : "Failed to launch app", 500);
    }
    return true;
  }

  if (method === "POST" && pathname === "/api/apps/stop") {
    const body = await readJsonBody<{ name?: string }>(req, res);
    if (!body) return true;
    if (!body.name?.trim()) {
      error(res, "name is required");
      return true;
    }
    const appName = body.name.trim();
    const pluginManager = getPluginManager();
    const result = await appManager.stop(pluginManager, appName);
    json(res, result as object);
    return true;
  }

  if (method === "GET" && pathname.startsWith("/api/apps/info/")) {
    const appName = decodeURIComponent(
      pathname.slice("/api/apps/info/".length),
    );
    if (!appName) {
      error(res, "app name is required");
      return true;
    }
    const pluginManager = getPluginManager();
    const info = await appManager.getInfo(pluginManager, appName);
    if (!info) {
      error(res, `App "${appName}" not found in registry`, 404);
      return true;
    }
    json(res, info as object);
    return true;
  }

  if (method === "GET" && pathname === "/api/apps/plugins") {
    try {
      const pluginManager = getPluginManager();
      const registry = await pluginManager.refreshRegistry();
      const plugins = Array.from(registry.values()).filter(
        isNonAppRegistryPlugin,
      );
      json(res, plugins);
    } catch (err) {
      error(
        res,
        `Failed to list plugins: ${err instanceof Error ? err.message : String(err)}`,
        502,
      );
    }
    return true;
  }

  if (method === "GET" && pathname === "/api/apps/plugins/search") {
    const query = url.searchParams.get("q") ?? "";
    if (!query.trim()) {
      json(res, []);
      return true;
    }
    try {
      const limit = parseBoundedLimit(url.searchParams.get("limit"));
      const pluginManager = getPluginManager();
      const results = await pluginManager.searchRegistry(query, limit);
      json(res, results.filter(isNonAppSearchResult));
    } catch (err) {
      error(
        res,
        `Plugin search failed: ${err instanceof Error ? err.message : String(err)}`,
        502,
      );
    }
    return true;
  }

  if (method === "POST" && pathname === "/api/apps/refresh") {
    try {
      const pluginManager = getPluginManager();
      const registry = await pluginManager.refreshRegistry();
      const count = Array.from(registry.values()).filter(
        isNonAppRegistryPlugin,
      ).length;
      json(res, { ok: true, count });
    } catch (err) {
      error(
        res,
        `Refresh failed: ${err instanceof Error ? err.message : String(err)}`,
        502,
      );
    }
    return true;
  }

  return false;
}
