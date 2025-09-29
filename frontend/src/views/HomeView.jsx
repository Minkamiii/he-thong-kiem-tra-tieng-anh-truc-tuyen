// import './css/HomeView.css';
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Container, Grid, Paper, Link, List, ListItem, ListItemText } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';

const HomeView = ({ isLoggedIn = false, user = null }) => {

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7ff', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Header isLoggedIn={isLoggedIn} user={user}/>

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
                    > LUYỆN ĐỀ IELTS ONLINE <br /> KHÔNG GIỚI HẠN </Typography>
                    <List sx={{ listStyleType: 'disc', pl: 4, mt: 2 }}>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Hỗ trợ luyện thi IELTS Listening, Reading, Writing"/>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Giao diện giống thi thật, thân thiện với người dùng"/>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Tự chọn task và thời gian làm theo nhu cầu"/>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', fontSize: '1.5rem' }}>
                            <ListItemText primary="Report điểm tự động + đánh giá chi tiết bài làm"/>
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