import { useState, useEffect, useRef } from "react";
import { Box, Button, Container, Grid, Link, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
//import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { data, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import authApi from "../../api/AuthApi.jsx";
import { setTest, resetTest, resetAnswer } from '../states/TestSlice.jsx';
import Header from "./Header";
import ReadingTest from "./ReadingTest";
import ListeningTest from "./ListeningTest";
import WritingTest from "./WritingTest";

const BaseTestUI = ({ testId, tasks }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation(); 

    const [activeTask, setActiveTask] = useState(0);
    const [, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [answers, setAnswers] = useState({}); // Store user answers here
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const questionsContainerRef = useRef(null);
    const isCountUp = useRef(false);

    //Khánh
    const startTime = useRef(Date.now());

    const [searchParams] = useSearchParams();
    //Khánh
    const mode = searchParams.get("mode");
    
    const selectedTaskIndices = searchParams.getAll('task').map(Number); // [0, 2] etc.

    const test = useSelector((state) => state.test);

    useEffect(() => {
    
        if(localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)){
            authApi.post('/introspect', {
                token: localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)
            }).then(res => {
                if(!user){
                    axios.get(`${import.meta.env.VITE_BASE_USER_SERVICE_LINK}/${localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_ID)}`)
                    .then(res => {
                        setUser(res.data.result);
                        setIsLoggedIn(true);
                    })
                    .catch(err => {
                        alert("Can not find user. Please login again.");
                        navigate("/home");
                    })
                }
            }).catch(err => {
                alert("Login session expired. Please login again.");
                navigate("/home");
            })
        }
        
    }, [])

    const handleOpenSubmitDialog = () => setOpenSubmitDialog(true);
    const handleCloseSubmitDialog = () => setOpenSubmitDialog(false);

    const handleConfirmSubmit = () => {
        handleCloseSubmitDialog();
        handleSubmit();
    }

    //submit test
    const handleSubmit = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_ID);
    
            if (!userId) {
                alert("User not found. Please log in again.");
                return;
            }
    
            // Calculate actual time taken
            const timeTakenSeconds = Math.floor((Date.now() - startTime.current) / 1000);
    
            // Build answers array
            const answersArray = Object.entries(test.answers).map(
                ([id_question, answer]) => ({ id_question, answer })
            );
    
            // Build submit payload
            const data = {
                user_id: userId,
                test_id: test._id,
                tasks: tasks.map(item => parseInt(item)),
                time_to_complete: timeTakenSeconds,
                kind: mode, // keep kind from state
                answers: answersArray,
            };
    
            // Send to backend
            const response = await axios.post(`${import.meta.env.VITE_BASE_SUBMIT_SERVICE_LINK}/newSubmit`, data);
    
            if (response.status === 200) {
                dispatch(resetTest()); // Clear answers after submit
                alert("Test submitted successfully!");
                navigate("/home");
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("Error submitting test. Please try again.");
        }
    };
    

    const handleReset = () => {
        if (window.confirm("Do you want to clear your current answers?")) {
            dispatch(resetAnswer());
            alert("Test reset successfully.");
          }
    }

    // Add answer handler
    const handleAnswerChange = (questionIndex, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

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
                    tasks={test.testTasks} 
                    activeTask={activeTask} 
                    questionsContainerRef={questionsContainerRef}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                />
            case 'listening':
                return <ListeningTest 
                    tasks={test.testTasks} 
                    activeTask={activeTask} 
                    questionsContainerRef={questionsContainerRef}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                />
            case 'writing':
                return <WritingTest
                    tasks={test.testTasks} 
                    activeTask={activeTask} 
                    questionsContainerRef={questionsContainerRef}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                />
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
        setLoading(true);
        axios.get(`http://[::1]:8000/api/test/${testId}`)
            .then((response) => {
                const testData = response.data;
                dispatch(setTest({
                    _id: testData._id,
                    testName: testData.testName,
                    testType: testData.type,
                    testTasks: tasks.map(item => testData.tasks[parseInt(item)]),
                    kind: mode
                }));
            })
            .catch((error) => console.error("Failed to fetch test details:", error))
            .finally(() => setLoading(false));
    }, [dispatch, testId]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7ff', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Header isLoggedIn={isLoggedIn} user={user} />

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ flex: 1, py: 2}}>
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
                        <Box sx={{p:2, borderRadius: 0, border: '1px solid #ccc' }}>
                            
                            {/* Highlight task buttons */}
                            <Box sx={{display: 'flex', gap: 2}}>
                                {test.testTasks.map((task, index) => (
                                    <Button
                                        key={parseInt(tasks[index])}
                                        variant={activeTask === index ? 'contained' : 'outlined'}
                                        color={activeTask === index ? 'primary' : 'inherit'}
                                        sx={{
                                            boxShadow: activeTask === index ? 3 : 0,
                                            fontWeight: activeTask === index ? 'bold' : 'normal',
                                        }}
                                        onClick={() => setActiveTask(index)}
                                    >
                                        {`Task ${parseInt(tasks[index]) + 1}`}
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
                            {test.testTasks.map((task, taskIndex) => (
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