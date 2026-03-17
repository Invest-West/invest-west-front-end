import React from 'react';
import PdfViewer from './PdfViewer';
import OfficeViewer from './OfficeViewer';

const PDF_EXTENSIONS = ['.pdf'];
const OFFICE_EXTENSIONS = ['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'];

/**
 * Get file extension from a filename (lowercase, including the dot).
 */
const getExtension = (fileName = '') => {
    const match = fileName.match(/\.[^.]+$/);
    return match ? match[0].toLowerCase() : '';
};

/**
 * Check whether a file can be rendered inline.
 */
export const isInlineViewable = (fileName = '') => {
    const ext = getExtension(fileName);
    return PDF_EXTENSIONS.includes(ext) || OFFICE_EXTENSIONS.includes(ext);
};

/**
 * Unified inline document viewer.
 * Renders PDFs via react-pdf and Office docs via @cyntler/react-doc-viewer.
 *
 * Props:
 *   url      {string} — public URL of the document
 *   fileName {string} — display name (used to detect file type and for download)
 */
const InlineDocViewer = ({ url, fileName = 'document' }) => {
    const ext = getExtension(fileName);

    if (PDF_EXTENSIONS.includes(ext)) {
        return <PdfViewer url={url} fileName={fileName} />;
    }

    if (OFFICE_EXTENSIONS.includes(ext)) {
        return <OfficeViewer url={url} fileName={fileName} />;
    }

    // Unsupported type — should not reach here if isInlineViewable is used
    return null;
};

export default InlineDocViewer;
