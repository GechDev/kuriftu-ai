/** LiveKit server REST API expects https, not wss. */
export function livekitHttpUrl(serverUrl: string): string {
  return serverUrl.replace(/^wss:\/\//i, "https://").replace(/^ws:\/\//i, "http://");
}
