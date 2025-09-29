import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';


const TestChooseBoxView = ({testId, testName = 'Test 1', testType = 'Listening', testTime = 40, 
                        numOfTasks = 4, numOfQuestions = 40, doneStatus = false}) => {
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
                onClick={() => navigate(`/test/${testId}`)}
            >
                <Typography variant="h5" fontWeight={700} sx={{
                    
                }}>{testName}</Typography>
                <Typography>{testTime + ' phút | ' + testType}</Typography>
                <Typography>{numOfTasks + ' phần thi | ' + numOfQuestions + ' câu hỏi'}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    
                    sx={{
                        alignItems: 'center',
                        mt: 2,
                        width: '100%'
                    }}
                >{doneStatus ? 'Xem kết quả' : 'Chi tiết'}</Button>
            </Paper>
        </Box>
    );
}

export default TestChooseBoxView;