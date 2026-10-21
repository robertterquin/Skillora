import { useVideoConfig } from "remotion";

export function useLayout() {
  const { width: W, height: H } = useVideoConfig();
  const portrait = H > W;
  return { W, H, portrait, pick: <T>(landscape: T, port: T): T => (portrait ? port : landscape) };
}
