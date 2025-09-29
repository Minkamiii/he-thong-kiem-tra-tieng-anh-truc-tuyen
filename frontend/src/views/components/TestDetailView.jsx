import { Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Grid, Box, Divider, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import BaseUI from './BaseUI';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setTest } from '../states/TestSlice.jsx';


const TestDetailView = ( {testId, isLoggedIn = false, user = null} ) => {

    const [checked, setChecked] = useState([0]);
    const test = useSelector((state) => state.test);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch test details from API using testId
        setLoading(true);
        console.log(testId);
        axios.get(`http://[::1]:8000/api/test/${testId}`)
            .then((response) => {
                console.log(response.data);
                dispatch(setTest({
                    _id: response.data._id,
                    testName: response.data.testName,
                    testType: response.data.type, // Map 'type' from response to 'testType'
                    testTasks: response.data.tasks
                }));
            })
            .catch((error) => {
                console.error("Failed to fetch test details:", error);
            })
            .finally(() => setLoading(false));
    }, [dispatch, testId]);

    if (loading) {
        return (
            <BaseUI isLoggedIn={isLoggedIn} user={user}>
                <Typography variant='h5' fontWeight={700} sx={{}}>Loading...</Typography>
            </BaseUI>
        );
    }

    if (!test) {
        return (
            <BaseUI isLoggedIn={isLoggedIn} user={user}>
                <Typography variant='h5' fontWeight={700} sx={{}}>Test not found</Typography>
            </BaseUI>
        );
    }

    // Calculate numOfTasks and numOfQuestions from test data if needed
    // MinhTran counts
    const numOfTasks = Array.isArray(test.testTasks) ? test.testTasks.length : 0;
    const numOfQuestions = Array.isArray(test.testTasks) 
        ? test.testTasks.reduce((taskTotal, task) => {
            const sections = Array.isArray(task?.sections) ? task.sections : [];
            return taskTotal + sections.reduce((sectionTotal, section) => {
                const questions = Array.isArray(section?.questions) ? section.questions : [];
                return sectionTotal + questions.length;
            }, 0);
        }, 0)
        : 0;

    const handleToggle = (value) => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex == -1) newChecked.push(value);
        else newChecked.splice(currentIndex, 1);

        setChecked(newChecked);
    }

    const handleStartTest = () => {
        // Logic to start the test
        console.log("Starting test...");

    }

    return (
        <BaseUI isLoggedIn={isLoggedIn} user={user}>
            <Grid container spacing={1}>
                {/* Test Detail */}
                <Grid item xs={12} md={12}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        //justifyContent: 'center',
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #ccc',
                        
                    }}>
                        <Typography variant='h3' fontWeight={700} sx={{mb:2}}>{test.testName}</Typography>
                        <Typography variant='h6'>{`ID: ${test._id}`}</Typography>
                        <Typography variant='h6'>{`Type: ${test.testType} | ${numOfTasks} phần thi | ${numOfQuestions} câu hỏi`}</Typography>
                        <Divider sx={{width: '100%', mt: 2}}/>
                        
                        {/* Show câu hỏi */}
                        <List component='nav' sx={{ width: '100%' }}>
                            {test.testTasks.map((task, index) => {
                                const labelId = `checkbox-list-label-${index}`;
                                return (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            disablePadding
                                        >
                                            <ListItemButton onClick={() => handleToggle(index)}>
                                                <ListItemIcon>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={checked.includes(index)}
                                                        tabIndex={-1}
                                                        disableRipple
                                                    />
                                                </ListItemIcon>
                                                <ListItemText id={labelId} primary={`Task ${parseInt(index) + 1} (${task.sections?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0} câu hỏi)`} />
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                );
                            })}
                        </List>

                        {/* Time limit  */}
                        <Typography sx={{mb: 2}}>{`Giới hạn thời gian (Để trống để làm bài không giới hạn):`}</Typography>
                        
                        {/* Start Test Button */}
                        <Button variant='contained' color='primary' onClick={handleStartTest}>Bắt đầu làm bài</Button>


                    </Box>
                </Grid>
                {/* Comment */}
                <Grid item xs={12} md={12}>

                </Grid>
            </Grid>
        </BaseUI>
    );
}

export default TestDetailView;
