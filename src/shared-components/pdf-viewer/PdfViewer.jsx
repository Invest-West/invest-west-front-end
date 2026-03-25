import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
    Box, Button, IconButton, Typography, CircularProgress
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';

pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Inline PDF viewer with scrollable pages and download button.
 *
 * Props:
 *   url      {string} — public URL of the PDF (e.g. Firebase Storage)
 *   fileName {string} — display name shown in toolbar and used for download
 */
const PDF_LOAD_TIMEOUT_MS = 15000;

const PdfViewer = ({ url, fileName = 'document.pdf' }) => {
    const [numPages, setNumPages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                setError(true);
                setLoading(false);
            }
        }, PDF_LOAD_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

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
                <Typography variant="body2" color="textSecondary">
                    Unable to preview this PDF.
                </Typography>
                <Button component="a" href={url} target="_blank" rel="noopener noreferrer"
                    download={fileName} variant="outlined" size="small" style={{ marginTop: 8 }}>
                    Download {fileName}
                </Button>
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
                    <Typography variant="body2" style={{ marginRight: 8 }}>
                        {loading ? '...' : `${numPages} page${numPages !== 1 ? 's' : ''}`}
                    </Typography>
                    <IconButton size="small" component="a" href={url}
                        download={fileName} target="_blank" rel="noopener noreferrer"
                        aria-label="Download PDF">
                        <GetAppIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Scrollable PDF render area */}
            <Box bgcolor="#525659" padding={2}
                style={{ overflowY: 'auto', maxHeight: '80vh' }}>
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center"
                        minHeight={400}>
                        <CircularProgress style={{ color: 'white' }} />
                    </Box>
                )}
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={null}
                >
                    {numPages && Array.from({ length: numPages }, (_, i) => (
                        <Box key={i + 1} display="flex" justifyContent="center"
                            marginBottom={2}>
                            <Page
                                pageNumber={i + 1}
                                width={Math.min(window.innerWidth - 80, 800)}
                                renderTextLayer
                                renderAnnotationLayer
                            />
                        </Box>
                    ))}
                </Document>
            </Box>
        </Box>
    );
};

export default PdfViewer;
