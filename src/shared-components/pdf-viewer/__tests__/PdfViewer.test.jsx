import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-pdf to avoid worker/canvas issues in Jest
jest.mock('react-pdf', () => {
    const React = require('react');
    return {
        Document: ({ children, onLoadSuccess }) => {
            React.useEffect(() => {
                if (onLoadSuccess) onLoadSuccess({ numPages: 3 });
            }, []);
            return <div data-testid="mock-pdf-document">{children}</div>;
        },
        Page: ({ pageNumber }) => (
            <div data-testid="mock-pdf-page">Page {pageNumber}</div>
        ),
        pdfjs: { GlobalWorkerOptions: {}, version: '3.11.174' }
    };
});

// Mock the CSS imports
jest.mock('react-pdf/dist/esm/Page/AnnotationLayer.css', () => ({}));
jest.mock('react-pdf/dist/esm/Page/TextLayer.css', () => ({}));

import PdfViewer from '../PdfViewer';
import { isInlineViewable } from '../InlineDocViewer';

describe('PdfViewer', () => {
    const url = 'https://firebasestorage.example.com/test.pdf';
    const fileName = 'test-document.pdf';

    it('renders the PDF document', async () => {
        render(<PdfViewer url={url} fileName={fileName} />);
        await waitFor(() =>
            expect(screen.getByTestId('mock-pdf-document')).toBeInTheDocument()
        );
    });

    it('displays the file name in the toolbar', async () => {
        render(<PdfViewer url={url} fileName={fileName} />);
        await waitFor(() =>
            expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
        );
    });

    it('shows page count after load', async () => {
        render(<PdfViewer url={url} fileName={fileName} />);
        await waitFor(() =>
            expect(screen.getByText('1 / 3')).toBeInTheDocument()
        );
    });

    it('download button has correct href', async () => {
        render(<PdfViewer url={url} fileName={fileName} />);
        await waitFor(() => {
            const downloadBtn = screen.getByLabelText('Download PDF');
            expect(downloadBtn).toHaveAttribute('href', url);
        });
    });

    it('previous page button is disabled on first page', async () => {
        render(<PdfViewer url={url} fileName={fileName} />);
        await waitFor(() => {
            expect(screen.getByLabelText('Previous page')).toBeDisabled();
        });
    });
});

describe('isInlineViewable', () => {
    it('returns true for .pdf files', () => {
        expect(isInlineViewable('pitch-deck.pdf')).toBe(true);
    });

    it('returns true for .PDF (case-insensitive)', () => {
        expect(isInlineViewable('DOCUMENT.PDF')).toBe(true);
    });

    it('returns true for .docx files', () => {
        expect(isInlineViewable('report.docx')).toBe(true);
    });

    it('returns true for .doc files', () => {
        expect(isInlineViewable('old-report.doc')).toBe(true);
    });

    it('returns true for .pptx files', () => {
        expect(isInlineViewable('slides.pptx')).toBe(true);
    });

    it('returns true for .ppt files', () => {
        expect(isInlineViewable('old-slides.ppt')).toBe(true);
    });

    it('returns true for .xlsx files', () => {
        expect(isInlineViewable('financials.xlsx')).toBe(true);
    });

    it('returns true for .xls files', () => {
        expect(isInlineViewable('old-financials.xls')).toBe(true);
    });

    it('returns false for unsupported types like .zip', () => {
        expect(isInlineViewable('archive.zip')).toBe(false);
    });

    it('returns false for image files', () => {
        expect(isInlineViewable('photo.jpg')).toBe(false);
    });

    it('returns false for empty string', () => {
        expect(isInlineViewable('')).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isInlineViewable(undefined)).toBe(false);
    });
});
