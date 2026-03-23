/**
 * Converts a Google Drive share/view URL to an embeddable preview iframe src.
 *
 * Supported input formats:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 *
 * Returns the embed URL or null if the input is not a Drive link.
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (!parsed.hostname.includes("drive.google.com")) return null;

    // /file/d/FILE_ID/... format
    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }

    // ?id=FILE_ID format
    const idParam = parsed.searchParams.get("id");
    if (idParam) {
      return `https://drive.google.com/file/d/${idParam}/preview`;
    }

    return null;
  } catch {
    return null;
  }
}

export function isGoogleDriveUrl(url: string): boolean {
  return getGoogleDriveEmbedUrl(url) !== null;
}
