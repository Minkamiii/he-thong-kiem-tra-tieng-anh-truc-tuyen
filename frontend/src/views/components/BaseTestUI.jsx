import { useState, useEffect, useRef } from "react";
import { Box, Button, Container, Grid, Link, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
//import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import { setTest } from '../states/TestSlice.jsx';

import Header from "./Header";
import ReadingTest from "./ReadingTest";
import ListeningTest from "./ListeningTest";
import WritingTest from "./WritingTest";

const BaseTestUI = ({ testId, tasks, isLoggedIn = false, user = null }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const [activeTask, setActiveTask] = useState(0);
    const [, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

    const questionsContainerRef = useRef(null);
    const isCountUp = useRef(false);

    const [searchParams] = useSearchParams();
    const selectedTaskIndices = searchParams.getAll('task').map(Number); // [0, 2] etc.

    const test = useSelector((state) => state.test);
    const filteredTasks = Array.isArray(test?.testTasks)
        ? selectedTaskIndices.map(idx => test.testTasks[idx]).filter(Boolean)
        : [];

    const handleOpenSubmitDialog = () => setOpenSubmitDialog(true);
    const handleCloseSubmitDialog = () => setOpenSubmitDialog(false);
    const handleConfirmSubmit = () => {
        handleCloseSubmitDialog();
        handleSubmit();
    }

    const handleSubmit = () => {
        // Handle test submission logic here
        alert("Test submitted!");
    }

    const handleReset = () => {
        // Handle test reset logic here
        alert("Test reset!");
    }

    // Scroll handler function
    const handleQuestionClick = (questionIndex) => {
        if (!questionsContainerRef.current) return;

        const questionElement = questionsContainerRef.current.querySelector(
            `[data-question-index="${questionIndex}"]`
        );

        if (questionElement) {
            const container = questionsContainerRef.current;
            const containerHeight = container.clientHeight;
            const questionTop = questionElement.offsetTop;

            // Calculate scroll position to put question in middle
            const targetScroll = Math.max(
                0, 
                Math.min(
                    questionTop - containerHeight / 2,
                    container.scrollHeight - containerHeight
                )
            );

            container.scrollTo({
                top: targetScroll,
                behavior: 'auto'
            });
        }
    }

    // Components for different test types
    const renderTestComponent = () => {
        switch (test?.testType.toLowerCase()) {
            case 'reading':
                return <ReadingTest 
                    tasks={filteredTasks} 
                    activeTask={activeTask} 
                    questionsContainerRef={questionsContainerRef}
                />;
            case 'listening':
                return <ListeningTest 
                    tasks={filteredTasks} 
                    activeTask={activeTask} 
                    questionsContainerRef={questionsContainerRef}
                />;
            case 'writing':
                return <WritingTest
                    tasks={filteredTasks} 
                    activeTask={activeTask} 
                    questionsContainerRef={questionsContainerRef}
                />;
            default:
                return (
                    <>
                        <Typography variant='h5' fontWeight={700} sx={{mb:2}}>Test Interface Placeholder</Typography>
                        <Typography>{`This is where the test interface of task ${activeTask + 1} will be rendered.`}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{mt:2}}>
                            (This is a placeholder. Actual test content will be dynamically loaded here based on the test data.)
                        </Typography>
                    </>
                );
        }
    }

    // Setup time counter
    useEffect(() => {
        const timeParam = new URLSearchParams(location.search).get('time');
        const minutes = parseInt(timeParam);

        if (!timeParam || minutes === 0) {
            isCountUp.current = true;
            setTimeElapsed(0);
            setTimeLeft(null);
        }
        else {
            isCountUp.current = false;
            setTimeElapsed(0);
            setTimeLeft(minutes * 60) // convert minute to second
        }
    }, [location]);

    // Setup timer
    useEffect(() => {
        let timer;

        if (isCountUp.current) {
            // Count up timer
            timer = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        else if (timeLeft !== null) {
            // Count down timer
            if (timeLeft <= 0) {
                handleSubmit();
                return;
            }
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }

        return () => clearInterval(timer);

    }, [timeLeft/*, isCountUp.current */]);

    // Time formatter
    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Fetch data
    useEffect(() => {
        // Fetch test details from API using testId
        setLoading(true);
        axios.get(`http://[::1]:8000/api/test/${testId}`)
            .then((response) => {
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

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7ff', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Header isLoggedIn={isLoggedIn} user={user} />

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ flex: 1, py: 6 }}>
                {/* Title and back button */}
                <Grid
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography fontWeight='bold' sx={{mr:1}}>{test?.testName}</Typography>
                    <Button onClick={() => navigate(`/test/${test?._id}`)}>Back</Button>
                </Grid>

                {/* Main test area and sidebar*/}
                <Grid container spacing={2} sx={{my:2}}>
                    {/* Left side: Test interface */}
                    <Grid item size={{xs:12, md:10}} sx={{
                        order: {xs:2, md:1},
                    }}>
                        <Box sx={{p:2, borderRadius: 2, border: '1px solid #ccc' }}>
                            
                            {/* Highlight task buttons */}
                            <Box sx={{display: 'flex', gap: 2, mb:3}}>
                                {Array.isArray(tasks) && tasks.map((task, index) => (
                                    <Button
                                        key={index}
                                        variant={activeTask === index ? 'contained' : 'outlined'}
                                        color={activeTask === index ? 'primary' : 'inherit'}
                                        sx={{
                                            boxShadow: activeTask === index ? 3 : 0,
                                            fontWeight: activeTask === index ? 'bold' : 'normal',
                                        }}
                                        onClick={() => setActiveTask(index)}
                                    >
                                        {`Task ${parseInt(task) + 1}`}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                        {/* Test interface */}
                        {renderTestComponent()}
                    </Grid>

                    {/* Right side: Timer, Submit button, Task name, Question button */}
                    <Grid item size={{xs:12, md:2}} sx={{order: {xs:1, md:2}}}>
                        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, width: '100%' }}>
                            
                            <Typography fontWeight='bold'>Time remaining:</Typography>
                            <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{
                                    mt:1,
                                    color: !isCountUp.current && timeLeft < 300 ? 'error.main' : 'inherit' // Red when < 5 mins
                                }}
                            >
                                {isCountUp.current ? formatTime(timeElapsed) : formatTime(timeLeft)}
                            </Typography>
                            
                            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleOpenSubmitDialog}>Submit</Button>

                            <Link onClick={handleReset} sx={{ display: 'block', mt: 2, cursor: 'pointer'}}>Restore/Save answers</Link>

                            {/* Tasks and Questions Navigation */}
                            {filteredTasks.map((task, taskIndex) => (
                                <Box key={taskIndex} sx={{mt:2}}>
                                    <Typography fontWeight='bold' sx={{mb:1}}>
                                        {`Task ${selectedTaskIndices[taskIndex] + 1}:`}
                                    </Typography>

                                    {/* Grid of buttons. When clicked, scroll to that question */}
                                    <Grid container spacing={1}>
                                        {task.sections?.map((section) => 
                                            section.questions?.map((question) => (
                                                <Grid item key={question.index}>
                                                    <Button
                                                        size="small"
                                                        variant={activeTask === taskIndex ? 'contained' : 'outlined'}
                                                        sx={{
                                                            minWidth: '32px',
                                                            height: '32px',
                                                            p: 0,
                                                            fontWeight: '0.75rem',
                                                        }}
                                                        onClick={() => {
                                                            setActiveTask(taskIndex);
                                                            handleQuestionClick(question.index);
                                                        }}
                                                    >{question.index + 1}</Button>
                                                </Grid>
                                            ))
                                        )}
                                    </Grid>

                                </Box>
                            ))}
                            
                            
                            

                        </Paper>
                    </Grid>
                </Grid>

            </Container>
            
            <Dialog
                open={openSubmitDialog}
                onClose={handleCloseSubmitDialog}
                aria-labelledby="submit-dialog-title"
                aria-describedby="submit-dialog-description"
            >
                <DialogTitle id="submit-dialog-title">{"Xác nhận nộp bài"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="submit-dialog-description">
                        Are you sure you want to submit your answers?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSubmitDialog}>Back</Button>
                    <Button onClick={handleConfirmSubmit} autoFocus variant="contained">OK</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default BaseTestUI;