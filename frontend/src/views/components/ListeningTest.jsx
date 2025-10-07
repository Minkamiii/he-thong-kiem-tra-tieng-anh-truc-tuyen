import React, { useState } from 'react';
import { Grid, Box, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import Section from './Section';

const ListeningTest = ({ tasks, activeTask, questionsContainerRef }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const currentTask = tasks && tasks[activeTask] ? tasks[activeTask] : null;

    if (!currentTask) {
        return <Typography>No task data available.</Typography>;
    }

    // Mock audio controls - replace with actual audio functionality
    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        // Add actual audio play/pause logic here
    };

    const handleReplay = () => {
        setIsPlaying(true);
        // Add actual audio replay logic here
    };

    return (
        <Grid container sx={{
            mt: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'left',
        }}>
            {/* Audio Player */}
            <Grid item size={{xs: 12, md: 12}}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 2,
                    border: '1px solid #ccc',
                    backgroundColor: '#eee',
                }}>
                    {/* Audio Controls */}
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <IconButton 
                            size="large"
                            onClick={handlePlayPause}
                            sx={{ 
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                }
                            }}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <IconButton
                            onClick={handleReplay}
                            sx={{ 
                                backgroundColor: 'grey.300',
                                '&:hover': {
                                    backgroundColor: 'grey.400',
                                }
                            }}
                        >
                            <ReplayIcon />
                        </IconButton>
                    </Box>
                    
                    {/* Audio Status */}
                    <Typography variant="body1">
                        {isPlaying ? "Playing audio..." : "Audio paused"}
                    </Typography>
                    
                    {/* Temporary: Display mock audio content */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                        {currentTask?.audio || "No audio available"}
                    </Typography>
                </Box>
            </Grid>

            {/* Questions */}
            <Grid item size={{xs: 12, md: 12}}>
                <Box 
                    ref={questionsContainerRef}
                    sx={{
                        overflowY: 'scroll',
                        height: '100vh',
                        p: 2,
                        border: '1px solid #ccc',
                        backgroundColor: '#fff',
                    }}
                >
                    {currentTask?.sections && currentTask.sections.length > 0
                        ? currentTask.sections.map((section, index) => (
                            <Section key={index} section={section} />
                        )) : (
                            <Typography>No sections available for this task.</Typography>
                        )}
                </Box>
            </Grid>
        </Grid>
    );
};

export default ListeningTest;