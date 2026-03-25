import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-pdf to simulate load ERROR (not success)
jest.mock('react-pdf', () => {
    const React = require('react');
    return {
        Document: ({ children, onLoadError }) => {
            React.useEffect(() => {
                if (onLoadError) onLoadError(new Error('load failed'));
            }, []);
            return <div data-testid="mock-pdf-document">{children}</div>;
        },
        Page: ({ pageNumber }) => (
            <div data-testid="mock-pdf-page">Page {pageNumber}</div>
        ),
        pdfjs: { GlobalWorkerOptions: {}, version: '3.11.174' }
    };
});

jest.mock('react-pdf/dist/esm/Page/AnnotationLayer.css', () => ({}));
jest.mock('react-pdf/dist/esm/Page/TextLayer.css', () => ({}));

import PdfViewer from '../PdfViewer';

describe('PdfViewer error fallback', () => {
    const url = 'https://firebasestorage.example.com/broken.pdf';
    const fileName = 'broken.pdf';

    it('renders download fallback when onLoadError fires', async () => {
        render(<PdfViewer url={url} fileName={fileName} />);
        await waitFor(() =>
            expect(screen.getByText(/Unable to preview this PDF/)).toBeInTheDocument()
        );
        const downloadBtn = screen.getByRole('link', { name: /Download broken\.pdf/ });
        expect(downloadBtn).toHaveAttribute('href', url);
    });

    it('does not show spinner when in error state', async () => {
        render(<PdfViewer url={url} fileName={fileName} />);
        await waitFor(() =>
            expect(screen.getByText(/Unable to preview this PDF/)).toBeInTheDocument()
        );
        expect(screen.queryByRole('progressbar')).toBeNull();
    });
});
