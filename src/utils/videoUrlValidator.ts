/**
 * Returns true if the given URL is a supported embeddable video link.
 * Accepted platforms: YouTube, Vimeo, Wistia, Dailymotion, Twitch (clips),
 * Facebook (videos), Google Drive (file view/preview links).
 */
export const ACCEPTED_VIDEO_PLATFORMS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "wistia.com",
  "wi.st",
  "dailymotion.com",
  "twitch.tv",
  "facebook.com",
  "drive.google.com",
];

export function isValidVideoUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");
    return ACCEPTED_VIDEO_PLATFORMS.some(
      (platform) => host === platform || host.endsWith("." + platform)
    );
  } catch {
    return false;
  }
}

export function acceptedPlatformsText(): string {
  return "YouTube, Vimeo, Wistia, Dailymotion, Twitch, Facebook, or Google Drive";
}
