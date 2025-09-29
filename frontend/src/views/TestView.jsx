// import './css/HomeView.css';
import React, { useEffect, useState } from 'react';
import { Typography, Grid, Pagination } from '@mui/material';
import { useSearchParams, useLocation } from 'react-router-dom';

import axios from 'axios';
import TestChooseBoxView from './components/TestChooseBoxView';
import BaseUI from './components/BaseUI';


const TestView = ({ isLoggedIn = false, user = null } = {}) => {
    // const params = useParams();

    const [, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [testInPageArray, setTestInPageArray] = useState(Array(0));
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);


    const page = Number(new URLSearchParams(location.search).get('page')) || 1;

    // Ensure URL always includes ?page=1 at minimum
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (!params.has('page')) {
            setSearchParams({ page: '1' }, { replace: true });
        }
        // Only react to the raw search string to avoid unnecessary runs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setTestInPageArray([]);
        const requestedPage = page;
        axios
            .get(`http://[::1]:8000/api/test?page=${page}`, { signal: controller.signal })
            .then((response) => {
                console.log(response.data);
                if (requestedPage !== page) return; // ignore stale response
                const items = response.data.data;
                const total = response.data.totalPages;
                setTestInPageArray(items);
                setTotalPages(total);
            })
            .catch((error) => {
                if (axios.isCancel(error)) return;
                console.error("Failed to fetch tests:", error);
            })
            .finally(() => setLoading(false));

        return () => {
            controller.abort();
        };
    }, [page]);

    const handlePageChange = (event, value) => {
        const params = new URLSearchParams(location.search);
        const pageInUrl = Number(params.get('page')) || 1;
        if (pageInUrl !== value) setSearchParams({ page: String(value) }, { replace: false });
    }

    return (
        <BaseUI isLoggedIn={isLoggedIn} user={user}>
            <Typography mb={2} variant="h4" fontWeight={700}>Thư viện đề thi</Typography>
            {/* Change this to search by category */}
            <Grid container spacing={2} mb={5}>
                <Grid item sx={{xs:12, md:1}}>Reading</Grid>
                <Grid item sx={{xs:12, md:1}}>Listening</Grid>
                <Grid item sx={{xs:12, md:1}}>Writing</Grid>   
            </Grid>
            {/* Display tests in a page */}
            <Grid container spacing={4} mb={5}>
                {testInPageArray.map((test, idx) => {
                    const numOfTasks = Array.isArray(test?.tasks) ? test.tasks.length : 0;
                    const numOfQuestions = Array.isArray(test?.tasks)
                        ? test.tasks.reduce((taskTotal, task) => {
                            const sections = Array.isArray(task?.sections) ? task.sections : [];
                            return taskTotal + sections.reduce((sectionTotal, section) => {
                                const questions = Array.isArray(section?.questions) ? section.questions : [];
                                return sectionTotal + questions.length;
                            }, 0);
                        }, 0)
                        : 0;

                    // console.log('Rendering testId:', test?._id);

                    return (
                        <Grid item xs={12} md={3} key={test?._id ?? idx}>
                            {() => console.log('Rendering testId:', test?._id)}
                            <TestChooseBoxView 
                                testId={test?._id ?? idx}
                                testName={test?.testName ?? 'Lorem ipsum'}
                                testType={test?.type ?? 'Lorem ipsum'}
                                testTime={test?.time ?? 60}
                                numOfTasks={numOfTasks}
                                numOfQuestions={numOfQuestions}
                                doneStatus={false}
                            />
                        </Grid>
                    );
                })}
            </Grid>
            {/* Pagination */}
            <Pagination count={totalPages} page={page} disabled={loading} onChange={handlePageChange}/>
        </BaseUI>
    );
};

export default TestView;