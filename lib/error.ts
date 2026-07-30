// The single error seam. A static site has no telemetry backend; every
// catch still routes here so swallowed errors are impossible and a future
// reporter is a one-line change.
export function reportError(error: unknown, context: { readonly source: string }): void {
  console.error(`[letools:${context.source}]`, error)
}
