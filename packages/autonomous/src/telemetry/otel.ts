/**
 * OpenTelemetry SDK initialization for Milady.
 *
 * Reads `diagnostics.otel` from MiladyConfig and bootstraps trace, metric,
 * and log pipelines that export to the configured OTLP endpoint (typically
 * the Railway-hosted OTEL Collector).
 *
 * Must be called early in the startup sequence — before any HTTP servers or
 * plugins are initialized — so that auto-instrumentation patches the relevant
 * Node.js modules before they are first required.
 */

import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  PeriodicExportingMetricReader,
  type PushMetricExporter,
} from "@opentelemetry/sdk-metrics";
import {
  BatchLogRecordProcessor,
  type LogRecordExporter,
} from "@opentelemetry/sdk-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";

import type { DiagnosticsOtelConfig } from "../config/types.milady";

const MILADY_VERSION = process.env.npm_package_version ?? "0.0.0";

let sdk: NodeSDK | undefined;

export interface OtelInitResult {
  started: boolean;
  endpoint: string;
  services: { traces: boolean; metrics: boolean; logs: boolean };
}

/**
 * Initialize the OpenTelemetry SDK from the Milady diagnostics config.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function initOtel(otelConfig: DiagnosticsOtelConfig): OtelInitResult {
  if (sdk || !otelConfig.enabled) {
    return {
      started: false,
      endpoint: otelConfig.endpoint ?? "",
      services: { traces: false, metrics: false, logs: false },
    };
  }

  const endpoint = otelConfig.endpoint ?? "http://localhost:4318";
  const serviceName = otelConfig.serviceName ?? "milady";
  const sampleRate = otelConfig.sampleRate ?? 1.0;
  const flushIntervalMs = otelConfig.flushIntervalMs ?? 30_000;
  const enableTraces = otelConfig.traces !== false;
  const enableMetrics = otelConfig.metrics !== false;
  const enableLogs = otelConfig.logs !== false;

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

  const headers: Record<string, string> = { ...otelConfig.headers };

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: MILADY_VERSION,
    "deployment.environment": process.env.RAILWAY_ENVIRONMENT ?? "local",
    "host.name":
      process.env.RAILWAY_SERVICE_NAME ?? process.env.HOSTNAME ?? "unknown",
  } as Record<string, string>);

  const traceExporter = enableTraces
    ? new OTLPTraceExporter({ url: `${endpoint}/v1/traces`, headers })
    : undefined;

  const metricReader = enableMetrics
    ? new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${endpoint}/v1/metrics`,
          headers,
        }) as PushMetricExporter,
        exportIntervalMillis: flushIntervalMs,
      })
    : undefined;

  const logProcessor = enableLogs
    ? new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: `${endpoint}/v1/logs`,
          headers,
        }) as LogRecordExporter,
      )
    : undefined;

  if (sampleRate < 1.0) {
    process.env.OTEL_TRACES_SAMPLER = "parentbased_traceidratio";
    process.env.OTEL_TRACES_SAMPLER_ARG = String(sampleRate);
  }

  sdk = new NodeSDK({
    resource,
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (req) => {
          const url = req.url ?? "";
          return url === "/health" || url === "/healthz" || url === "/ready";
        },
      }),
      new FetchInstrumentation(),
    ],
    ...(traceExporter && { traceExporter }),
    ...(metricReader && { metricReader }),
    ...(logProcessor && { logRecordProcessor: logProcessor }),
  });
  sdk.start();

  return {
    started: true,
    endpoint,
    services: { traces: enableTraces, metrics: enableMetrics, logs: enableLogs },
  };
}

/** Graceful shutdown — flush pending telemetry before process exit. */
export async function shutdownOtel(): Promise<void> {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch {
    // Best-effort; process is exiting anyway.
  } finally {
    sdk = undefined;
  }
}
