import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import { CheckCircle, Person, AccessTime, EditNote } from '@mui/icons-material';
import dayjs from 'dayjs';

const TestChooseBoxView = ({ test, numOfTasks, numOfQuestions, numOfUserDone, thisUserDoneBefore }) => {

    const getStandardTime = (testType) => {
        switch (testType?.toLowerCase()) {
            case 'reading': return 60;
            case 'writing': return 60;
            case 'listening': return 45;
            default: return 0;
        }
    }

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
                <Typography variant="h6" fontWeight={700} sx={{display: "flex", alignItems: "center", fontSize: "clamp(0.8rem, 2vw, 1.1rem)"}}>
                    {thisUserDoneBefore && <CheckCircle sx={{color: 'green', fontSize: 18, ml: -0.5, mr: 0.5}}/>}
                    {(test?.testName ?? 'Lorem ipsum')}
                </Typography>
                <Typography sx={{display: "flex", alignItems: "center"}}>
                    {`${dayjs(test.createdAt).format('DD/MM/YYYY')} | `}
                    <Person sx={{fontSize: 18, mx: 0.25}}/>
                    {`${numOfUserDone}`}
                </Typography>
                <Typography sx={{display: "flex", alignItems: "center"}}>
                    <AccessTime sx={{fontSize: 18, ml: -0.5, mr: 0.5}} />
                    {getStandardTime(test?.type) + ' mins | '}
                    <EditNote sx={{fontSize: 18, mx: 0.25}} />
                    {(test?.type ?? 'Lorem ipsum')}
                </Typography>
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