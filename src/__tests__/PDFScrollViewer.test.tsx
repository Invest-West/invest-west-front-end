import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock react-pdf to avoid worker setup in Jest
jest.mock("react-pdf", () => {
  const ReactModule = require("react");
  return {
    Document: ({ onLoadSuccess, children }: any) => {
      ReactModule.useEffect(() => { onLoadSuccess({ numPages: 3 }); }, []);
      return <div data-testid="pdf-document">{children}</div>;
    },
    Page: ({ pageNumber }: any) => <div data-testid={`pdf-page-${pageNumber}`} />,
    pdfjs: { GlobalWorkerOptions: {} },
  };
});

// Mock the CSS imports
jest.mock("react-pdf/dist/esm/Page/AnnotationLayer.css", () => ({}));
jest.mock("react-pdf/dist/esm/Page/TextLayer.css", () => ({}));

import PdfViewer from "../shared-components/pdf-viewer/PdfViewer";

describe("PDF Scrollable Viewer", () => {
  it("renders all pages when document loads (no page-navigation state)", () => {
    render(<PdfViewer url="https://example.com/test.pdf" fileName="test.pdf" />);
    expect(screen.getByTestId("pdf-page-1")).toBeInTheDocument();
    expect(screen.getByTestId("pdf-page-2")).toBeInTheDocument();
    expect(screen.getByTestId("pdf-page-3")).toBeInTheDocument();
  });

  it("does NOT render pagination buttons", () => {
    const { queryByRole } = render(
      <PdfViewer url="https://example.com/test.pdf" fileName="test.pdf" />
    );
    expect(queryByRole("button", { name: /previous|next|page/i })).toBeNull();
  });
});
