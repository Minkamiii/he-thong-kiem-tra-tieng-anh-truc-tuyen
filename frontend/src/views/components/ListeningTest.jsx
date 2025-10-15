import React, { useState } from 'react';
import { Grid, Box, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import Section from './Section';
import AudioPlayer from './AudioPlayer';

const ListeningTest = ({ tasks, activeTask, questionsContainerRef }) => {
    const currentTask = tasks && tasks[activeTask] ? tasks[activeTask] : null;

    if (!currentTask) {
        return <Typography>No task data available.</Typography>;
    }

    return (
        <Grid container sx={{
            mt: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'left',
        }}>
            {/* Audio Player */}
            <AudioPlayer src={currentTask.audio} />

            {/* Questions */}
            <Grid item size={{xs: 12, md: 12}}>
                <Box 
                    ref={questionsContainerRef}
                    sx={{
                        overflowY: 'auto',
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