import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';


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
                <Typography>{(test?.time ?? 60) + ' phút | ' + (test?.type ?? 'Lorem ipsum')}</Typography>
                <Typography>{(numOfTasks ?? 4) + ' phần thi | ' + (numOfQuestions ?? 40) + ' câu hỏi'}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    
                    sx={{
                        alignItems: 'center',
                        mt: 2,
                        width: '100%'
                    }}
                >{'Chi tiết'}</Button>
            </Paper>
        </Box>
    );
}

export default TestChooseBoxView;