import React, { useState, useEffect } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { Box, Button, IconButton, Typography, CircularProgress } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';

export const OFFICE_LOAD_TIMEOUT_MS = 15000;

/**
 * Inline viewer for Office documents (DOCX, PPTX, XLSX, etc.)
 * Uses @cyntler/react-doc-viewer which renders Office files via
 * Microsoft Office Online embed for publicly accessible URLs.
 *
 * Includes a loading timeout that falls back to a download button
 * if the document cannot be previewed within OFFICE_LOAD_TIMEOUT_MS.
 *
 * Props:
 *   url      {string} — public URL of the document (e.g. Firebase Storage)
 *   fileName {string} — display name shown in toolbar and used for download
 */
const OfficeViewer = ({ url, fileName = 'document' }) => {
    const [timedOut, setTimedOut] = useState(false);
    const docs = [{ uri: url, fileName }];

    useEffect(() => {
        const timer = setTimeout(() => setTimedOut(true), OFFICE_LOAD_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [url]);

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

            {/* Document render area */}
            {timedOut ? (
                <Box padding={2} textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                        Preview is not available for this file type in the current environment.
                    </Typography>
                    <Button component="a" href={url} target="_blank" rel="noopener noreferrer"
                        download={fileName} variant="outlined" size="small" style={{ marginTop: 8 }}>
                        Download {fileName}
                    </Button>
                </Box>
            ) : (
                <Box minHeight={500} position="relative">
                    <Box position="absolute" top={0} left={0} right={0} bottom={0}
                        display="flex" justifyContent="center" alignItems="center"
                        zIndex={0}>
                        <CircularProgress />
                    </Box>
                    <Box position="relative" zIndex={1}>
                        <DocViewer
                            documents={docs}
                            pluginRenderers={DocViewerRenderers}
                            config={{
                                header: { disableHeader: true }
                            }}
                            style={{ height: 500 }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default OfficeViewer;
