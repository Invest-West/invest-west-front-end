import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
    Box, IconButton, Typography, CircularProgress
} from '@material-ui/core';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import GetAppIcon from '@material-ui/icons/GetApp';

pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Inline PDF viewer with page navigation and download button.
 *
 * Props:
 *   url      {string} — public URL of the PDF (e.g. Firebase Storage)
 *   fileName {string} — display name shown in toolbar and used for download
 */
const PdfViewer = ({ url, fileName = 'document.pdf' }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = () => {
        setError(true);
        setLoading(false);
    };

    if (error) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" padding={2}>
                <Typography variant="body2" color="error">
                    Unable to display PDF inline.{' '}
                    <a href={url} target="_blank" rel="noopener noreferrer" download={fileName}>
                        Download instead
                    </a>
                </Typography>
            </Box>
        );
    }

    return (
        <Box border="1px solid #e0e0e0" borderRadius={4} overflow="hidden"
            marginTop={2} marginBottom={2}>

            {/* Toolbar */}
            <Box display="flex" alignItems="center" justifyContent="space-between"
                bgcolor="#f5f5f5" paddingX={2} paddingY={1}>
                <Typography variant="body2" noWrap style={{ maxWidth: '60%' }}>
                    {fileName}
                </Typography>
                <Box display="flex" alignItems="center">
                    <IconButton size="small" disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(p => p - 1)}
                        aria-label="Previous page">
                        <NavigateBeforeIcon />
                    </IconButton>
                    <Typography variant="body2" style={{ minWidth: 60, textAlign: 'center' }}>
                        {loading ? '...' : `${pageNumber} / ${numPages}`}
                    </Typography>
                    <IconButton size="small" disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(p => p + 1)}
                        aria-label="Next page">
                        <NavigateNextIcon />
                    </IconButton>
                    <IconButton size="small" component="a" href={url}
                        download={fileName} target="_blank" rel="noopener noreferrer"
                        aria-label="Download PDF">
                        <GetAppIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* PDF render area */}
            <Box display="flex" justifyContent="center" bgcolor="#525659"
                minHeight={400} padding={2}>
                {loading && (
                    <Box display="flex" alignItems="center">
                        <CircularProgress style={{ color: 'white' }} />
                    </Box>
                )}
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                >
                    <Page
                        pageNumber={pageNumber}
                        width={Math.min(window.innerWidth - 80, 800)}
                        renderTextLayer
                        renderAnnotationLayer
                    />
                </Document>
            </Box>
        </Box>
    );
};

export default PdfViewer;
