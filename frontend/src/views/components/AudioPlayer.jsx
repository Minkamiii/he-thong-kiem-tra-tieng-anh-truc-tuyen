import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, IconButton, Slider, Typography } from "@mui/material";
import { VolumeOff, VolumeUp, PlayCircle, PauseCircle } from "@mui/icons-material";


const AudioPlayer = ({ src }) => {

    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if(!audio) return;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        }

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0)
        }

        const handleLoadedMetaData = () => {
            setDuration(audio.duration);
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetaData);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetaData);
        }
    }, [])

    useEffect(() => {
        const audio = audioRef.current;
        if(!audio) return;

        setIsPlaying(false);
        setProgress(0);

        const handleLoadedMetaData = () => {
            setDuration(audio.duration);
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetaData);

        return () => audio.removeEventListener('loadedmetadata', handleLoadedMetaData);
    }, [src])

    const togglePlayPause = () => {

        const audio = audioRef.current;
        if(!audio) return;

        if(isPlaying){
            audio.pause();
        }
        else{
            audio.play();
        }

        setIsPlaying(!isPlaying);
    }

    const handleProgressChange = (ev, newValue) => {
        const audio = audioRef.current;
        if(!audio) return;

        audio.currentTime = newValue;
        setProgress(newValue);
    }

    const handleVolumeChange = (ev, newValue) => {
        const audio = audioRef.current;
        if(!audio) return;

        audio.volume = newValue;
        setVolume(newValue);
        if(newValue === 0){
            setMuted(true);
        }
        else if(muted) {
            setMuted(false);
        }
    }

    const toggleMute = () => {
        const audio = audioRef.current;
        if(!audio) return;

        audio.muted = !muted;
        setMuted(!muted);
    }

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                px: 2,
                py: 2,
                border: '1px solid #ccc',
                bgcolor: '#fff',
            }}
        >
            <audio ref={audioRef} src={src} />
            <IconButton
                size="large"
                sx={{
                    color: 'primary.main',
                    p: 0.5
                }}
                onClick={togglePlayPause}
            >
                {isPlaying ? <PauseCircle fontSize="inherit" /> : <PlayCircle fontSize="inherit" />}
            </IconButton>
            <Typography
                variant="body2"
                sx={{
                    minWidth: 60,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    mr: -2
                }}
            >
                {formatTime(progress)}
            </Typography>
            <Slider
                value={progress}
                min={0}
                max={duration}
                sx={{
                    flexGrow: 1,
                    mx: 0.5,
                    color: 'primary.main'
                }}
                onChange={handleProgressChange}
            />
            <IconButton
                size="small"
                sx={{
                    color: 'text.secondary',
                    p: 0.5
                }}
                onClick={toggleMute}
            >
                {muted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
                value={volume}
                min={0}
                max={1}
                step={0.01}
                sx={{
                    width: 100,
                    color: 'primary.main',
                    mr: 2
                }}
                onChange={handleVolumeChange}
            />
        </Box>
    );
}

export default AudioPlayer;