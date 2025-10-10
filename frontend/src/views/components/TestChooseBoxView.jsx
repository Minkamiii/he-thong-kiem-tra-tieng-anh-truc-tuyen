import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';

const TestChooseBoxView = ({ test, numOfTasks, numOfQuestions }) => {
    const navigate = useNavigate();
    //console.log('testId in TestChooseBoxView:', testId);
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Paper
                elevation={3}
                sx={{
                    p:2,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1,
                }}
                onClick={() => navigate(`/test/${test?._id}`)}
            >
                <Typography variant="h5" fontWeight={700} sx={{
                    
                }}>{(test?.testName ?? 'Lorem ipsum')}</Typography>
                <Typography>
                    {`${dayjs(test.createdAt).format('DD/MM/YYYY')}`}
                </Typography>
                <Typography>{(test?.time ?? 60) + ' mins | ' + (test?.type ?? 'Lorem ipsum')}</Typography>
                <Typography>{(numOfTasks ?? 4) + ' tasks | ' + (numOfQuestions ?? 40) + ' questions'}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    
                    sx={{
                        alignItems: 'center',
                        mt: 2,
                        width: '100%'
                    }}
                >{'Details'}</Button>
            </Paper>
        </Box>
    );
}

export default TestChooseBoxView;