import { useVideoConfig } from "remotion";

/** Frame size plus a picker for values that differ between the landscape and portrait cuts. */
export function useLayout() {
  const { width: W, height: H } = useVideoConfig();
  const portrait = H > W;
  return { W, H, portrait, pick: <T>(landscape: T, port: T): T => (portrait ? port : landscape) };
}
