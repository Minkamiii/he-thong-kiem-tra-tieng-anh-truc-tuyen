// import './css/HomeView.css';
import React, { useEffect, useState } from 'react';
import { Typography, Grid, Pagination, TextField, InputAdornment, Button } from '@mui/material';
import { useSearchParams, useLocation } from 'react-router-dom';
import SearchIcon from "@mui/icons-material/Search";

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
    const [filterType, setFilterType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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

        // Construct URL based on whether there's a filter type
        const baseUrl = filterType 
            ? `http://[::1]:8000/api/test/type/${filterType}` 
            : 'http://[::1]:8000/api/test';

        const testViewUrl = `${baseUrl}?page=${page}${searchQuery ? `&search=${searchQuery}` : ''}`;

        axios
            .get(testViewUrl, { signal: controller.signal })
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
    }, [filterType, page, searchQuery]);

    const handlePageChange = (event, value) => {
        const params = new URLSearchParams(location.search);
        // const pageInUrl = Number(params.get('page')) || 1;
        // if (pageInUrl !== value) setSearchParams({ page: String(value) }, { replace: false });
        params.set('page', String(value));
        setSearchParams(params);
    }

    const handleFilterType = (type) => {
        const params = new URLSearchParams(location.search);
        if (type === filterType) params.delete('type');
        else params.set('type', type);

        params.set('page', '1'); // Reset to first page
        setFilterType(prev => prev === type ? '' : type);
        setSearchParams(params);
    }

    const handleSearch = (event) => {
        const params = new URLSearchParams(location.search);
        const query = event.target.value;
        if (query) params.set('search', query);
        else params.delete('search');

        params.set('page', '1');
        setSearchQuery(query);
        setSearchParams({ page: '1' });
    }

    return (
        <BaseUI isLoggedIn={isLoggedIn} user={user}>
            <Typography mb={2} variant="h4" fontWeight={700}>Thư viện đề thi</Typography>
            
            {/* Search Bar */}
            <TextField
                fullwidth
                variant="outlined"
                placeholder="Nhập từ khóa bạn muốn tìm kiếm: tên đề thi, loại đề,..."
                value={searchQuery}
                onChange={handleSearch}
                sx={{mb:3}}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            
            {/* Change this to search by category */}
            <Grid container  mb={5}>
                <Grid item>
                    <Button
                        sx={{width:'14vh'}}
                        onClick={() => handleFilterType('')}
                        variant={filterType === '' ? 'contained' : 'text'}
                        color="primary"
                    >All</Button>
                </Grid>
                <Grid item>
                    <Button
                        sx={{width:'14vh'}}
                        onClick={() => handleFilterType('reading')}
                        variant={filterType === 'reading' ? 'contained' : 'text'}
                        color="primary"
                    >Reading</Button>
                </Grid>
                <Grid item>
                    <Button
                        sx={{width:'14vh'}}
                        onClick={() => handleFilterType('listening')}
                        variant={filterType === 'listening' ? 'contained' : 'text'}
                        color="primary"
                    >Listening</Button>
                </Grid>
                <Grid item>
                    <Button
                        sx={{width:'14vh'}}
                        onClick={() => handleFilterType('writing')}
                        variant={filterType === 'writing' ? 'contained' : 'text'}
                        color="primary"
                    >Writing</Button>
                </Grid>   
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
                        <Grid item size={{xs:12, md:3}} key={test?._id ?? idx}>
                            {() => console.log('Rendering testId:', test?._id)}
                            <TestChooseBoxView 
                                test={test}
                                numOfTasks={numOfTasks}
                                numOfQuestions={numOfQuestions}
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