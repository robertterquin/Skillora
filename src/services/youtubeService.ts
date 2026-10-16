import https from "https";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channel: string;
  url: string;
}

const searchCache = new Map<string, YouTubeSearchResult | null>();

export async function searchTopYouTubeVideo(
  query: string,
  timeoutMs = 4000
): Promise<YouTubeSearchResult | null> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  if (searchCache.has(cleanQuery)) {
    return searchCache.get(cleanQuery) || null;
  }

  return new Promise((resolve) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;

    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const jsonMatch =
              data.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
              data.match(/ytInitialData\s*=\s*({[\s\S]+?});/);

            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[1]);
              const contents =
                parsed.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
                  ?.contents;

              if (contents && Array.isArray(contents)) {
                for (const c of contents) {
                  const itemSection = c.itemSectionRenderer?.contents;
                  if (itemSection && Array.isArray(itemSection)) {
                    for (const item of itemSection) {
                      if (item.videoRenderer) {
                        const vr = item.videoRenderer;
                        const videoId = vr.videoId;
                        if (videoId && typeof videoId === "string" && videoId.length === 11) {
                          const title =
                            vr.title?.runs?.[0]?.text ||
                            vr.title?.simpleText ||
                            "YouTube Tutorial";
                          const channel =
                            vr.ownerText?.runs?.[0]?.text || "YouTube";

                          const result: YouTubeSearchResult = {
                            videoId,
                            title,
                            channel,
                            url: `https://www.youtube.com/watch?v=${videoId}`,
                          };

                          searchCache.set(cleanQuery, result);
                          return resolve(result);
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch {
          }

          const match = data.match(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (match && match[1]) {
            const result: YouTubeSearchResult = {
              videoId: match[1],
              title: "YouTube Tutorial",
              channel: "YouTube",
              url: `https://www.youtube.com/watch?v=${match[1]}`,
            };
            searchCache.set(cleanQuery, result);
            return resolve(result);
          }

          searchCache.set(cleanQuery, null);
          resolve(null);
        });
      }
    );

    req.on("error", () => {
      searchCache.set(cleanQuery, null);
      resolve(null);
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      searchCache.set(cleanQuery, null);
      resolve(null);
    });
  });
}

export interface ResourceInput {
  id?: string;
  step_id?: string;
  platform_name: string;
  url: string;
  resource_type: string;
  is_free: boolean;
}

export interface StepInput {
  id?: string;
  skill_id?: string;
  step_number: number;
  title: string;
  instructions: string;
  estimated_minutes: number;
  resources?: ResourceInput[];
}

export async function enrichStepsWithYouTube(
  skillTitle: string,
  steps: StepInput[]
): Promise<StepInput[]> {
  const enrichedSteps = await Promise.all(
    steps.map(async (st) => {
      let resources = await Promise.all(
        (st.resources || []).map(async (res) => {
          const isVideo =
            res.resource_type === "video" ||
            res.url.includes("youtube.com") ||
            res.url.includes("youtu.be");

          if (!isVideo) {
            return res;
          }

          const query = `${skillTitle} ${st.title} tutorial`;
          const ytResult = await searchTopYouTubeVideo(query);

          if (ytResult) {
            return {
              ...res,
              platform_name: `YouTube (${ytResult.channel})`,
              url: ytResult.url,
              resource_type: "video" as const,
            };
          }

          return {
            ...res,
            platform_name: "YouTube",
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            resource_type: "video" as const,
          };
        })
      );

      const hasVideo = resources.some(
        (r) =>
          r.resource_type === "video" ||
          r.url.includes("youtube.com") ||
          r.url.includes("youtu.be")
      );

      if (!hasVideo) {
        const query = `${skillTitle} ${st.title} tutorial`;
        const ytResult = await searchTopYouTubeVideo(query);
        if (ytResult) {
          resources = [
            ...resources,
            {
              id: undefined,
              step_id: st.id,
              platform_name: `YouTube (${ytResult.channel})`,
              url: ytResult.url,
              resource_type: "video",
              is_free: true,
            },
          ];
        } else {
          resources = [
            ...resources,
            {
              id: undefined,
              step_id: st.id,
              platform_name: "YouTube",
              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
              resource_type: "video",
              is_free: true,
            },
          ];
        }
      }

      return {
        ...st,
        resources,
      };
    })
  );

  return enrichedSteps;
}
