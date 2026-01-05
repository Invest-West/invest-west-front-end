import React from "react";
import DescriptionIcon from "@material-ui/icons/Description";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import ImageIcon from "@material-ui/icons/Image";
import TableChartIcon from "@material-ui/icons/TableChart";
import SlideshowIcon from "@material-ui/icons/Slideshow";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

interface DocumentIconProps {
    fileName: string;
    size?: number;
    style?: React.CSSProperties;
    className?: string;
}

const getFileExtension = (fileName: string): string => {
    const parts = fileName.toLowerCase().split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "";
};

const DocumentIcon: React.FC<DocumentIconProps> = ({ fileName, size = 48, style, className }) => {
    const extension = getFileExtension(fileName);

    const iconStyle: React.CSSProperties = {
        width: size,
        height: size,
        marginRight: 8,
        ...style
    };

    // PDF files
    if (extension === "pdf") {
        return <PictureAsPdfIcon className={className} style={{ ...iconStyle, color: "#E53935" }} />;
    }

    // Word documents
    if (["doc", "docx", "odt", "rtf"].includes(extension)) {
        return <DescriptionIcon className={className} style={{ ...iconStyle, color: "#2B579A" }} />;
    }

    // Excel/Spreadsheet files
    if (["xls", "xlsx", "csv", "ods"].includes(extension)) {
        return <TableChartIcon className={className} style={{ ...iconStyle, color: "#217346" }} />;
    }

    // PowerPoint/Presentation files
    if (["ppt", "pptx", "odp"].includes(extension)) {
        return <SlideshowIcon className={className} style={{ ...iconStyle, color: "#D24726" }} />;
    }

    // Image files
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(extension)) {
        return <ImageIcon className={className} style={{ ...iconStyle, color: "#4CAF50" }} />;
    }

    // Default document icon for other file types
    return <InsertDriveFileIcon className={className} style={{ ...iconStyle, color: "#5f6368" }} />;
};

export default DocumentIcon;
