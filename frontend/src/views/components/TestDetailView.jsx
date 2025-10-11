import { Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Grid, Box, Divider, Button, Select, MenuItem, Tabs, Tab } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseUI from './BaseUI';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { setTest, setTaskAndAnswers } from '../states/TestSlice.jsx';

const TestMode = {
    custom: "practice",
    standard: "exam"
}

const TestDetailView = ( {testId, isLoggedIn = false, user = null} ) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [tab, setTab] = useState(TestMode.standard);
    const [checked, setChecked] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeLimit, setTimeLimit] = useState(0);

    const test = useSelector((state) => state.test);

    const getStandardTime = (testType) => {
        switch (testType?.toLowerCase()) {
            case 'reading': return 60;
            case 'writing': return 60;
            case 'listening': return 45;
            default: return 0;
        }
    }
    useEffect(() => {
        // Fetch test details from API using testId
        setLoading(true);
        axios.get(`http://[::1]:8000/api/test/${testId}`)
            .then((response) => {
                dispatch(setTest({
                    _id: response.data._id,
                    testName: response.data.testName,
                    testType: response.data.type, // Map 'type' from response to 'testType'
                    testTasks: response.data.tasks,
                    createdAt: response.data.createdAt // Add this line
                }));
            
                // Set defaults after fetching
                const allTasks = response.data.tasks.map((_, index) => index);
                setChecked(allTasks);
                const standardTime = getStandardTime(response.data.type);
                setTimeLimit(standardTime);
            })
            .catch((error) => {
                console.error("Failed to fetch test details:", error);
            })
            .finally(() => setLoading(false));
    }, [dispatch, testId]);

    // Add a separate useEffect to log Redux state changes
    useEffect(() => {
        console.log('Redux state updated:', test);
    }, [test]);

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
    // Backend will give this, these codes shall be removed
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

        newChecked.sort((a, b) => a - b); // Sort ascending
        setChecked(newChecked);
    }

    const getTimeOptions = () => {
        const maxTime = test?.testType?.toLowerCase() === 'listening' ? 55 : 75;
        const options = [];
        for (let i = 0; i <= maxTime; i += 5) {
            options.push(i);
        }
        return options;
    }

    const handleStartTest = () => {
        // Logic to start the test based on current settings (standard or custom)
        const taskParams = checked.map(idx => `task=${idx}`).join('&');
        const timeParam = timeLimit > 0 ? `&time=${timeLimit}` : '';
        const modeParam = `&mode=${tab}`

        const payload = {
            testTasks: checked.map(index => test.testTasks[index]),
            answers: {}
        }

        payload.testTasks?.forEach((task) => {
            task.sections?.forEach((section) => {
                section.questions?.forEach(({ question }) => {
                    if (question.type === 'choice') {
                        payload.answers[question._id] = []; // multiple choice as array
                    } else {
                        payload.answers[question._id] = ''; // fill-in as string
                    }
                });
            });
        });

        console.log(payload)

        dispatch(setTaskAndAnswers(payload));

        navigate(`/test/${test._id}/take?${taskParams}${timeParam}${modeParam}`);
    }

    return (
        <BaseUI isLoggedIn={isLoggedIn} user={user}>
            <Grid container spacing={1} sx={{alignItems: 'center', justifyContent: 'center', my:2}}>
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
                        <Typography variant='h6'>{`Type: ${test.testType} | ${numOfTasks} tasks | ${numOfQuestions} questions`}</Typography>
                        {/* Add creation date */}
                        <Typography variant='body1' color="text.secondary">
                            {`Created at: ${dayjs(test.createdAt).format('DD/MM/YYYY')}`}
                        </Typography>
                        <Divider sx={{width: '100%', mt: 2}}/>
                        

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
                                <Tab label="Standard" value={TestMode.standard} />
                                <Tab label="Customization" value={TestMode.custom} />
                            </Tabs>
                        </Box>

                        {tab === TestMode.standard && (
                            <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                                <Typography variant="h6">Standard IELTS Practice</Typography>
                                <Typography sx={{ my: 2 }}>
                                    This will start a standard test session with all tasks included and a time limit of <strong>{getStandardTime(test.testType)} minutes</strong>.
                                </Typography>
                            </Box>
                        )}

                        {tab === TestMode.custom && (
                            <Box sx={{ p: 2, width: '100%' }}>
                                {/* Show câu hỏi */}
                                <Typography sx={{mb: 1, fontWeight: 'bold'}}>Select tasks to practice:</Typography>
                                <List component='nav' sx={{ width: '100%', border: '1px solid #ddd', borderRadius: 1, mb: 3 }}>
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
                                                        <ListItemText id={labelId} primary={`Task ${parseInt(index) + 1} (${task.sections?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0} questions)`} />
                                                    </ListItemButton>
                                                </ListItem>
                                                {index < test.testTasks.length - 1 && <Divider />}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>

                                {/* Time limit  */}
                                <Typography sx={{mb: 1, fontWeight: 'bold'}}>{`Set time limit:`}</Typography>
                                <Select
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(e.target.value)}
                                    sx={{ mb:3, minWidth: 150, width: '100%' }}
                                >
                                    {getTimeOptions().map((minutes) => (
                                        <MenuItem key={minutes} value={minutes}>
                                            {minutes === 0 ? "Unlimited time" : `${minutes} minutes`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Box>
                        )}
                        
                        {/* Start Test Button */}
                        <Button 
                            variant='contained' 
                            color='primary' 
                            onClick={handleStartTest}
                            disabled={checked.length === 0}
                        >Start Test</Button>


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
