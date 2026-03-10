import { resolveAppAssetUrl } from "../utils/asset-url";

/** Number of bundled VRM avatars shipped with the app. */
const BASE_VRM_COUNT = 24;

/** Named VRM avatars that don't follow the milady-N convention.
 */
const NAMED_VRMS: {
    file: string;
    preview: string;
    label: string;
}[] = [{ file: "shaw.vrm", preview: "shaw.jpg", label: "Shaw" }];

export const VRM_COUNT = BASE_VRM_COUNT + NAMED_VRMS.length;

function normalizeAvatarIndex(index: number): number {
    if (!Number.isFinite(index)) return 1;
    const n = Math.trunc(index);
    if (n === 0) return 0;
    if (n < 1 || n > VRM_COUNT) return 1;
    return n;
}

/** Resolve a bundled VRM index (1–N) to its public asset URL. */
export function getVrmUrl(index: number): string {
    const normalized = normalizeAvatarIndex(index);
    const safeIndex = normalized > 0 ? normalized : 1;
    if (safeIndex <= BASE_VRM_COUNT) {
        return resolveAppAssetUrl(`vrms/milady-${safeIndex}.vrm`);
    }
    const named = NAMED_VRMS[safeIndex - BASE_VRM_COUNT - 1];
    return resolveAppAssetUrl(`vrms/${named.file}`);
}

/** Resolve a bundled VRM index (1–N) to its preview thumbnail URL. */
export function getVrmPreviewUrl(index: number): string {
    const normalized = normalizeAvatarIndex(index);
    const safeIndex = normalized > 0 ? normalized : 1;
    if (safeIndex <= BASE_VRM_COUNT) {
        return resolveAppAssetUrl(`vrms/previews/milady-${safeIndex}.png`);
    }
    const named = NAMED_VRMS[safeIndex - BASE_VRM_COUNT - 1];
    return resolveAppAssetUrl(`vrms/previews/${named.preview}`);
}

/** Resolve a bundled VRM index (1-N) to its custom background URL. */
export function getVrmBackgroundUrl(index: number): string {
    const normalized = normalizeAvatarIndex(index);
    const safeIndex = normalized > 0 ? normalized : 1;
    const EXT = "png";

    if (safeIndex <= BASE_VRM_COUNT) {
        return resolveAppAssetUrl(`vrms/backgrounds/milady-${safeIndex}.${EXT}`);
    }
    const named = NAMED_VRMS[safeIndex - BASE_VRM_COUNT - 1];
    const baseName = named.preview.split(".")[0];
    return resolveAppAssetUrl(`vrms/backgrounds/${baseName}.${EXT}`);
}

/** Human-readable roster title for bundled avatars. */
export function getVrmTitle(index: number): string {
    const normalized = normalizeAvatarIndex(index);
    const safeIndex = normalized > 0 ? normalized : 1;
    if (safeIndex <= BASE_VRM_COUNT) {
        return `MILADY-${String(safeIndex).padStart(2, "0")}`;
    }
    const named = NAMED_VRMS[safeIndex - BASE_VRM_COUNT - 1];
    return named.label.toUpperCase();
}

/** Whether a bundled index points to the official Milady avatar set. */
export function isOfficialVrmIndex(index: number): boolean {
    return false;
}

export { normalizeAvatarIndex };
