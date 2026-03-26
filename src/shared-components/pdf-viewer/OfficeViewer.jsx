import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Button, IconButton, Typography, CircularProgress } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';

export const OFFICE_LOAD_TIMEOUT_MS = 20000;

/**
 * Inline viewer for Office documents (DOCX, PPTX, XLSX, etc.)
 * Uses Google Docs Viewer via iframe — works with Firebase Storage URLs
 * since both are Google services.
 *
 * Falls back to a download button if the preview cannot load.
 *
 * Props:
 *   url      {string} — public URL of the document (e.g. Firebase Storage)
 *   fileName {string} — display name shown in toolbar and used for download
 */
const OfficeViewer = React.memo(({ url, fileName = 'document' }) => {
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const timerRef = useRef(null);

    const embedUrl = useMemo(
        () => `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`,
        [url]
    );

    useEffect(() => {
        setIframeLoaded(false);
        setTimedOut(false);
        timerRef.current = setTimeout(() => setTimedOut(true), OFFICE_LOAD_TIMEOUT_MS);
        return () => clearTimeout(timerRef.current);
    }, [url]);

    const handleIframeLoad = () => {
        clearTimeout(timerRef.current);
        setIframeLoaded(true);
    };

    const showFallback = timedOut && !iframeLoaded;

    return (
        <Box border="1px solid #e0e0e0" borderRadius={4} overflow="hidden"
            marginTop={2} marginBottom={2}>

            {/* Toolbar */}
            <Box display="flex" alignItems="center" justifyContent="space-between"
                bgcolor="#f5f5f5" paddingX={2} paddingY={1}>
                <Typography variant="body2" noWrap style={{ maxWidth: '70%' }}>
                    {fileName}
                </Typography>
                <IconButton size="small" component="a" href={url}
                    download={fileName} target="_blank" rel="noopener noreferrer"
                    aria-label="Download document">
                    <GetAppIcon />
                </IconButton>
            </Box>

            {/* Document render area — iframe stays mounted to avoid reload flicker */}
            <Box minHeight={500} position="relative" style={{ width: '100%' }}>
                {!iframeLoaded && !showFallback && (
                    <Box position="absolute" top={0} left={0} right={0} bottom={0}
                        display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                )}

                {showFallback && (
                    <Box position="absolute" top={0} left={0} right={0} bottom={0}
                        display="flex" flexDirection="column" justifyContent="center"
                        alignItems="center" zIndex={2} bgcolor="white">
                        <Typography variant="body2" color="textSecondary">
                            Preview is not available for this document.
                        </Typography>
                        <Button component="a" href={url} target="_blank" rel="noopener noreferrer"
                            download={fileName} variant="outlined" size="small" style={{ marginTop: 8 }}>
                            Download {fileName}
                        </Button>
                    </Box>
                )}

                <iframe
                    title={fileName}
                    src={embedUrl}
                    onLoad={handleIframeLoad}
                    style={{
                        width: '100%',
                        height: 500,
                        border: 'none',
                        opacity: iframeLoaded && !showFallback ? 1 : 0
                    }}
                    allowFullScreen
                />
            </Box>
        </Box>
    );
});

export default OfficeViewer;
