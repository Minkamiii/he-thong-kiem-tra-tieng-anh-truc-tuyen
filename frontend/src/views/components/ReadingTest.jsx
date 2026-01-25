import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import Section from './Section';

const ReadingTest = ({ tasks, activeTask, questionsContainerRef }) => {

    const currentTask = tasks && tasks[activeTask] ? tasks[activeTask] : null;

    if (!currentTask) {
        return <Typography>No task data available.</Typography>;
    }

    return (
        <Grid container sx={{
            mt: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'left',
            //height: '100vh',
        }}>
            {/* Passage */}
            <Grid item size={{ xs: 12, md: 6 }}>
                <Box sx={{
                    overflowY: 'auto',
                    height: '100vh',
                    p: 2,
                    width: '100%',
                    border: '1px solid #ccc',
                    backgroundColor: '#f5f5f5',
                }}>
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{
                        currentTask?.passage || "No passage available."
                    }</Typography>
                    {currentTask?.image &&
                        <Box
                            component="img"
                            src={currentTask?.image}
                            sx={{
                                width: '100%',
                                maxWidth: 550,
                                objectFit: 'contain',
                                display: 'block',
                                margin: '16px auto'
                            }}
                        />}
                </Box>
            </Grid>
            {/* Answer */}
            <Grid item size={{ xs: 12, md: 6 }}>
                <Box
                    ref={questionsContainerRef}
                    sx={{
                        overflowY: 'scroll',
                        height: '100vh',
                        p: 2,
                        width: '100%',
                        border: '1px solid #ccc',
                        backgroundColor: '#fff',
                    }}
                >
                    {currentTask?.sections && currentTask?.sections.length > 0
                        ? currentTask.sections.map((section, index) => (
                            <Section key={index} section={section} />
                        )) : (
                            <Typography>No sections available for this task.</Typography>
                        )}
                </Box>
            </Grid>
        </Grid>

    );
}


export default ReadingTest;