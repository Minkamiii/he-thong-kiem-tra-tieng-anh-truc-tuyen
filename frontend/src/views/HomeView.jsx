// import './css/HomeView.css';
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Container, Grid, Paper, Link, List, ListItem, ListItemText } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import { useSelector } from 'react-redux';
import axios from 'axios';

const HomeView = () => {

    const userState = useSelector(state => state.user);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if(userState.isLoggedIn) {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)}`,
                "Content-Type": 'application/json'
            }

            axios.get(`${import.meta.env.VITE_BASE_USER_SERVICE_LINK}/${localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_ID)}`, 
                // {headers: headers}
            )
                .then(response => {
                    setUser(response.data.result);
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }, [])

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7ff', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Header isLoggedIn={userState.isLoggedIn} user={user}/>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ flex: 1, py: 6 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h3" fontWeight={700} gutterBottom
                        sx={{color: '#024fc2'}}
                    > UNLIMITED <br /> IELTS PRACTICING </Typography>
                    <List sx={{ listStyleType: 'disc', pl: 4, mt: 2 }}>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Support for IELTS Listening, Reading, Writing practice"/>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Realistic test interface, user-friendly design"/>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Customizable tasks and timing based on needs"/>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Automated scoring + detailed feedback"/>
                        </ListItem>
                    </List>
                </Box>
            </Container>

            {/* Footer */}
            <Footer/>
        </Box>
    );
};

export default HomeView;