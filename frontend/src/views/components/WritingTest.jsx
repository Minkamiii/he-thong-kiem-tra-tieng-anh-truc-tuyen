import React, { useState } from 'react';
import { Box, Grid, Typography, Button, TextField } from '@mui/material';
import Section from './Section';

const WritingTest = ({ tasks, activeTask, questionsContainerRef}) => {

    const currentTask = tasks && tasks[activeTask] ? tasks[activeTask] : null;

    if (!currentTask) return <Typography>No task data available</Typography>

    return (
        <Grid container sx={{
            mt: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'left',
        }}>
            {/* Question Area - Left */}
            <Grid item size={{xs:12, md:6}}>
                <Box sx={{
                    overflowY: 'auto',
                    height: '100vh',
                    p: 2,
                    width: '100%',
                    border: '1px solid #ccc',
                    backgroundColor: '#f5f5f5',
                }}>
                    <Typography>
                        {currentTask.sections[0].questions[0].question.question}
                    </Typography>
                </Box>
            </Grid>

            {/* Writing Area - Right */}
            <Grid item size={{xs:12, md:6}}>
                <Box 
                    ref={questionsContainerRef}
                    sx={{
                        overflowY: 'auto',
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
                        )): (
                        <Typography>No sections available for this task.</Typography>
                    )}
                </Box>
            </Grid>
        </Grid>
    );
}


export default WritingTest;