import React, { useState } from 'react';
import { Box, Grid, Typography, Button, TextField } from '@mui/material';
import Section from './Section';

const WritingTest = ({ tasks, activeTask, questionsContainerRef}) => {

    const currentTask = tasks && tasks[activeTask] ? tasks[activeTask] : null;
    const image = currentTask?.sections?.[0]?.questions?.[0]?.question?.image;

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
                    {/* {currentTask.sections[0].questions[0].question?.image && <Box 
                        component="img" 
                        src={currentTask?.image}
                        sx={{
                            width: 550,
                            height: 550,
                            objectFit: 'cover',
                            alignSelf: 'center',
                            justifySelf: 'center'
                        }}
                    />} */}
                    {image ? (
                            <Box
                            component="img"
                            src={image}
                            alt="Question image"
                            sx={{
                                width: '100%',
                                maxWidth: 550,
                                objectFit: 'contain',
                                display: 'block',
                                margin: '16px auto'
                            }}
                            />

                            ) : (
                            <Typography sx={{ color: 'gray', mt: 1 }}>
                                (Không có hình ảnh)
                            </Typography>
                            )}
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