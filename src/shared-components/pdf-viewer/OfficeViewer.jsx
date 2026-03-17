import React from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { Box, IconButton, Typography } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';

/**
 * Inline viewer for Office documents (DOCX, PPTX, XLSX, etc.)
 * Uses @cyntler/react-doc-viewer which renders Office files via
 * Microsoft Office Online embed for publicly accessible URLs.
 *
 * Props:
 *   url      {string} — public URL of the document (e.g. Firebase Storage)
 *   fileName {string} — display name shown in toolbar and used for download
 */
const OfficeViewer = ({ url, fileName = 'document' }) => {
    const docs = [{ uri: url, fileName }];

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
            <Box minHeight={500}>
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
    );
};

export default OfficeViewer;
