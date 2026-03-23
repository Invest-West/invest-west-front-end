import { isValidVideoUrl } from "../utils/videoUrlValidator";

describe("isValidVideoUrl", () => {
  it("accepts YouTube watch URLs", () => {
    expect(isValidVideoUrl("https://www.youtube.com/watch?v=abc123")).toBe(true);
  });
  it("accepts youtu.be short links", () => {
    expect(isValidVideoUrl("https://youtu.be/abc123")).toBe(true);
  });
  it("accepts Vimeo URLs", () => {
    expect(isValidVideoUrl("https://vimeo.com/123456789")).toBe(true);
  });
  it("accepts Google Drive view links", () => {
    expect(isValidVideoUrl("https://drive.google.com/file/d/abc/view")).toBe(true);
  });
  it("accepts Wistia links", () => {
    expect(isValidVideoUrl("https://mycompany.wistia.com/medias/abc123")).toBe(true);
  });
  it("rejects arbitrary URLs", () => {
    expect(isValidVideoUrl("https://example.com/video.mp4")).toBe(false);
  });
  it("rejects empty strings", () => {
    expect(isValidVideoUrl("")).toBe(false);
  });
  it("rejects malformed URLs", () => {
    expect(isValidVideoUrl("not a url at all")).toBe(false);
  });
});
