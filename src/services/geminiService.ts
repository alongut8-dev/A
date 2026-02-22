import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

export async function searchYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `YouTube search: ${query}. Return top 5 videos as JSON: [{title, url}].`,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING },
          },
          required: ["title", "url"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) return [];

  try {
    const results = JSON.parse(text);
    return results.map((video: any) => {
      const videoId = extractVideoId(video.url);
      return {
        id: videoId || "",
        title: video.title,
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : "",
        url: video.url,
      };
    }).filter((v: YouTubeVideo) => v.id !== "");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
