import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock @cyntler/react-doc-viewer
jest.mock('@cyntler/react-doc-viewer', () => {
    const React = require('react');
    const DocViewer = React.forwardRef(({ documents }, ref) => (
        <div data-testid="mock-doc-viewer">
            {documents.map((doc, i) => (
                <span key={i}>{doc.fileName}</span>
            ))}
        </div>
    ));
    DocViewer.displayName = 'MockDocViewer';
    return {
        __esModule: true,
        default: DocViewer,
        DocViewerRenderers: []
    };
});

jest.mock('@cyntler/react-doc-viewer/dist/index.css', () => ({}));

import OfficeViewer, { OFFICE_LOAD_TIMEOUT_MS } from '../OfficeViewer';

describe('OfficeViewer', () => {
    const url = 'https://firebasestorage.example.com/report.docx';
    const fileName = 'quarterly-report.docx';

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders toolbar with file name', () => {
        render(<OfficeViewer url={url} fileName={fileName} />);
        const matches = screen.getAllByText(fileName);
        expect(matches.length).toBeGreaterThanOrEqual(1);
        // The first match should be in the toolbar (Typography)
        expect(matches[0]).toBeInTheDocument();
    });

    it('download button has correct href', () => {
        render(<OfficeViewer url={url} fileName={fileName} />);
        const downloadBtn = screen.getByLabelText('Download document');
        expect(downloadBtn).toHaveAttribute('href', url);
    });

    it('renders DocViewer before timeout', () => {
        render(<OfficeViewer url={url} fileName={fileName} />);
        expect(screen.getByTestId('mock-doc-viewer')).toBeInTheDocument();
        expect(screen.queryByText(/Preview is not available/)).toBeNull();
    });

    it('shows fallback download button after timeout', () => {
        render(<OfficeViewer url={url} fileName={fileName} />);

        act(() => {
            jest.advanceTimersByTime(OFFICE_LOAD_TIMEOUT_MS);
        });

        expect(screen.getByText(/Preview is not available/)).toBeInTheDocument();
        const downloadBtn = screen.getByRole('link', { name: `Download ${fileName}` });
        expect(downloadBtn).toHaveAttribute('href', url);
    });

    it('fallback is NOT shown before timeout', () => {
        render(<OfficeViewer url={url} fileName={fileName} />);

        act(() => {
            jest.advanceTimersByTime(OFFICE_LOAD_TIMEOUT_MS - 1);
        });

        expect(screen.queryByText(/Preview is not available/)).toBeNull();
        expect(screen.getByTestId('mock-doc-viewer')).toBeInTheDocument();
    });
});
