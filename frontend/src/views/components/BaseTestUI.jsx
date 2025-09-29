import { React, /*useEffect*/ } from "react";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import Header from "./Header";
import { Provider, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TestStore } from '../states/TestStore.jsx';

const BaseTestUI = ({ isLoggedIn = false, user = null, children }) => {
    const navigate = useNavigate();
    //const dispatch = useDispatch();
    const test = useSelector((state) => state.test);

    const handleSubmit = () => {
        // Handle test submission logic here
        alert("Test submitted!");
    }

    const handleReset = () => {
        // Handle test reset logic here
        alert("Test reset!");
    }

    // useEffect(() => {
    //     // Fetch test details from API using testId
    //     setLoading(true);
    //     axios.get(`http://[::1]:8000/api/test/${test._id}`)
    //         .then((response) => {
    //             console.log(response.data);
    //             dispatch(setTest({
    //                 _id: response.data._id,
    //                 testName: response.data.testName,
    //                 testType: response.data.type, // Map 'type' from response to 'testType'
    //                 testTasks: response.data.tasks
    //             }));
    //         })
    //         .catch((error) => {
    //             console.error("Failed to fetch test details:", error);
    //         })
    //         .finally(() => setLoading(false));
    // }, [dispatch, testId]);

    return (
        <Provider store={TestStore}>
            
            <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7ff', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Header isLoggedIn={isLoggedIn} user={user} />

                {/* Main Content */}
                <Container maxWidth="xl" sx={{ flex: 1, py: 6 }}>
                    <Grid
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Typography fontWeight='bold' sx={{mr:1}}>${test.testName}</Typography>
                        <Button onClick={() => navigate(`/test/${test._id}`)}>Thoát</Button>
                    </Grid>
                    <Grid container spacing={2} sx={{my:2}}>
                        <Grid item sx={{md:10}}>
                            <Box sx={{p:2, borderRadius: 2, border: '1px solid #ccc', minHeight: '70vh'}}>
                                {children}
                            </Box>
                        </Grid>
                        <Grid item sx={{md:2}}>
                            {/* Right side: Timer, Submit button, Task name, Question button */}
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography fontWeight='bold'>Thời gian làm bài:</Typography>
                                <Typography variant="body1" fontWeight='bold' sx={{mt:1}}>mm:ss</Typography>
                                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>Nộp bài</Button>

                                <Link onClick={handleReset} sx={{ display: 'block', mt: 2 }}>Làm lại</Link>

                                <Typography fontWeight='bold' sx={{mt:2}}>{`${test.testName}:`}</Typography>
                                
                                {/* Grid of buttons. When clicked, scroll to that question */}

                            </Paper>
                        </Grid>
                    </Grid>
                </Container>

            </Box>
        </Provider>
    );
}

export default BaseTestUI;