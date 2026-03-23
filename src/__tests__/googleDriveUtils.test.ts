import { getGoogleDriveEmbedUrl, isGoogleDriveUrl } from "../utils/googleDriveUtils";

describe("getGoogleDriveEmbedUrl", () => {
  it("converts /file/d/ID/view link to preview URL", () => {
    const result = getGoogleDriveEmbedUrl(
      "https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing"
    );
    expect(result).toBe("https://drive.google.com/file/d/1a2b3c4d5e/preview");
  });

  it("converts open?id=ID link to preview URL", () => {
    const result = getGoogleDriveEmbedUrl(
      "https://drive.google.com/open?id=1a2b3c4d5e"
    );
    expect(result).toBe("https://drive.google.com/file/d/1a2b3c4d5e/preview");
  });

  it("converts uc?id=ID link to preview URL", () => {
    const result = getGoogleDriveEmbedUrl(
      "https://drive.google.com/uc?id=1a2b3c4d5e"
    );
    expect(result).toBe("https://drive.google.com/file/d/1a2b3c4d5e/preview");
  });

  it("returns null for non-Drive URLs", () => {
    expect(getGoogleDriveEmbedUrl("https://youtube.com/watch?v=abc")).toBeNull();
  });

  it("returns null for malformed URLs", () => {
    expect(getGoogleDriveEmbedUrl("not a url")).toBeNull();
  });
});

describe("isGoogleDriveUrl", () => {
  it("returns true for valid Drive links", () => {
    expect(isGoogleDriveUrl("https://drive.google.com/file/d/abc/view")).toBe(true);
  });
  it("returns false for YouTube links", () => {
    expect(isGoogleDriveUrl("https://youtube.com/watch?v=abc")).toBe(false);
  });
});
