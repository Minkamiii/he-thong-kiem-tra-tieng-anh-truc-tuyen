// import './css/HomeView.css';
import React, { useEffect, useState } from 'react';
import { Typography, Grid, Pagination, TextField, InputAdornment, Button, FormControlLabel, Switch, Box } from '@mui/material';
import { useSearchParams, useLocation } from 'react-router-dom';
import SearchIcon from "@mui/icons-material/Search";

import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import axios from 'axios';
import TestChooseBoxView from './components/TestChooseBoxView';
import BaseUI from './components/BaseUI';

import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const TestView = ({ isLoggedIn = false, user = null } = {}) => {
    // const params = useParams();

    const [, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [testInPageArray, setTestInPageArray] = useState(Array(0));
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [filterType, setFilterType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);

    const params = new URLSearchParams(location.search);
    const page = Number(params.get('page')) || 1;
    const userId = user?.id || user?._id || "a68feeb1-14f5-435d-bb44-09700b3560fe";

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

        // Build query parameters
        const queryParams = new URLSearchParams({
            page: String(page),
            active: 'true'
        });

        if (searchQuery) queryParams.set('testName', searchQuery);
        if (filterType) queryParams.set('type', filterType);
        
        // Add date range if both dates are selected
        if (dateRange[0] && dateRange[1]) {
            const fromDate = dayjs(dateRange[0]).format('DDMMYYYY');
            const toDate = dayjs(dateRange[1]).format('DDMMYYYY');
            queryParams.set('fromto', `${fromDate}-${toDate}`);
        }

        const testViewUrl = `${import.meta.env.VITE_BASE_TEST_SERVICE_LINK}?${queryParams}`;

        axios
            .get(testViewUrl, { signal: controller.signal })
            .then(getTestResponse => {
                if (requestedPage !== page) return;
                const gotTestId = getTestResponse.data.data.map(test => test._id).join(",");

                return axios.get(`${import.meta.env.VITE_BASE_SUBMIT_SERVICE_LINK}/CheckDone?userID=${userId}&test_ids=${gotTestId}`)
                    .then(checkDoneResponse => {
                        let mergedData = getTestResponse.data.data.map((test, index) => ({
                            ...test,
                            number_of_user_done: checkDoneResponse.data.data[index].number_of_user_done,
                            this_user_done_before: checkDoneResponse.data.data[index].this_user_done_before,
                        }))

                        return{
                            data: mergedData,
                            totalPages: getTestResponse.data.totalPages
                        }
                    })
            })
                
            .then(result => {
                if (!result) return;
                setTestInPageArray(result.data);
                setTotalPages(result.totalPages);
            })
            .catch((error) => {
                if (!axios.isCancel(error)) {
                    console.error("Failed to fetch tests:", error);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [page, filterType, searchQuery, dateRange]);

    const handlePageChange = (event, value) => {
        const params = new URLSearchParams(location.search);
        // const pageInUrl = Number(params.get('page')) || 1;
        // if (pageInUrl !== value) setSearchParams({ page: String(value) }, { replace: false });
        params.set('page', String(value));
        setSearchParams(params);
    }

    const handleFilterType = (type) => {
        const params = new URLSearchParams(location.search);
        setFilterType(prev => prev === type ? '' : type);
        params.set('page', '1');
        if (type && type !== filterType) {
            params.set('type', type);
        } else {
            params.delete('type');
        }
        setSearchParams(params);
    }

    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        
        const params = new URLSearchParams(location.search);
        params.set('page', '1');
        if (query) {
            params.set('testName', query);
        } else {
            params.delete('testName');
        }
        setSearchParams(params);
    }

    return (
        <BaseUI isLoggedIn={isLoggedIn} user={user}>
            <Typography mb={2} variant="h4" fontWeight={700}>Test Library</Typography>
            
            {/* Search Bar */}
            <TextField
                fullwidth
                variant="outlined"
                placeholder="Enter keywords"
                value={searchQuery}
                onChange={handleSearch}
                sx={{mb:3, width: "100%"}}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            {/* Filter date and active test */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateRangePicker
                        value={dateRange}
                        onChange={(newValue) => {
                            setDateRange(newValue);
                            const params = new URLSearchParams(location.search);
                            params.set('page', '1');
                            setSearchParams(params);
                        }}
                        localeText={{ start: 'From', end: 'To' }}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                inputProps: {
                                    placeholder: 'DD/MM/YYYY'
                                }
                            }
                        }}
                        sx={{width: "25%"}}
                    />
                </LocalizationProvider>

            </Box>
            
            {/* Change this to search by category */}
            <Grid container  mb={5} display="flex" justifyContent="left" spacing={1}>
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
                    const numOfTasks = test.taskCount ?? 0;
                    const numOfQuestions = test.questionCount ?? 0;
                    const numOfUserDone = test.number_of_user_done;
                    const thisUserDoneBefore = test.this_user_done_before;

                    return (
                        <Grid item size={{xs:12, md:3}} key={test?._id ?? idx}>
                            {() => console.log('Rendering testId:', test?._id)}
                            <TestChooseBoxView
                                test={test}
                                numOfTasks={numOfTasks}
                                numOfQuestions={numOfQuestions}
                                numOfUserDone={numOfUserDone}
                                thisUserDoneBefore={thisUserDoneBefore}
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