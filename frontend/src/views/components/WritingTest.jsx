import React, { useState } from 'react';
import { Box, Grid, Typography, Button, TextField } from '@mui/material';

const WritingTest = ({ tasks, activeTask, questionsContainerRef}) => {
    const [showOutline, setShowOutline] = useState(false);
    const [outline, setOutline] = useState('');
    const [essay, setEssay] = useState('');

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
                    height: '100%',
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    backgroundColor: 'fff',
                    overflowY: 'auto',
                    gap: 2
                }}>
                    {currentTask?.sections?.map((section, index) => (
                        <Box key={index}>
                            {/* <Typography variant='h6' mb={1}>
                                {section.title}
                            </Typography> */}
                            {section.questions?.map((question, qIndex) => {
                                <Box key={qIndex} sx={{mb:3}}>
                                    <Typography>
                                        {`${question.question}`}
                                    </Typography>
                                </Box>
                            })}
                        </Box>
                    ))}
                </Box>
            </Grid>

            {/* Writing Area - Right */}
            <Grid item size={{xs:12, md:6}}>
                <Box 
                    ref={questionsContainerRef}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        
                    }}
                >
                    {/* Outline Toggle Button */}
                    <Button
                        varient='outlined'
                        onClick={() => setShowOutline(!showOutline)}
                        sx={{alighSelf: 'flex.start'}}
                    ></Button>

                    {/* Outline TextField */}
                    {showOutline && (
                        <TextField
                            multiline
                            placeholder="Write your outline here..."
                            value={outline}
                            onChange={(e) => setOutline(e.target.value)}
                            sx={{
                                width: '100%',
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#fff',
                                    minHeight: '150px'
                                }
                            }}
                        />
                    )}

                    {/* Essay Textfield */}
                    <TextField
                        multiline
                        placeholder='Write your essay here...'
                        value={essay}
                        onChange={(e) => setEssay(e.target.value)}
                        sx={{
                            flex:1,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#fff',
                                height: '100%'
                            },
                            '& .MuiOutlinedInput:input': {
                                height: '100% !important',
                                resize: 'vertical',
                                overflowY: 'auto'
                            }
                        }}
                    />

                    {/* Word Count */}
                    <Typography variant="caption" color="text.secondary" align="right">
                        {`Word count: ${essay.trim().split(/\s+/).filter(Boolean).length}`}
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    );
}


export default WritingTest;