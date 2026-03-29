import React from "react";
import ReactPlayer from "react-player";
import {isGoogleDriveUrl, getGoogleDriveEmbedUrl} from "../../utils/googleDriveUtils";

interface VideoPlayerProps {
    url: string;
    width?: string | number;
    height?: string | number;
    playing?: boolean;
    controls?: boolean;
    playsInline?: boolean;
    pip?: boolean;
    light?: boolean;
}

/**
 * Renders a video player that supports Google Drive URLs (via iframe)
 * and all other video platforms (via ReactPlayer).
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
    url,
    width = "100%",
    height = "auto",
    playing = false,
    controls = true,
    playsInline = false,
    pip = false,
    light = false,
}) => {
    if (isGoogleDriveUrl(url)) {
        return (
            <iframe
                src={getGoogleDriveEmbedUrl(url)!}
                width={width}
                height={height}
                allow="autoplay"
                style={{border: 0}}
                title="Google Drive video"
            />
        );
    }

    return (
        <ReactPlayer
            url={url}
            width={width}
            height={height}
            playing={playing}
            controls={controls}
            playsInline={playsInline}
            pip={pip}
            light={light}
        />
    );
};

export default VideoPlayer;
