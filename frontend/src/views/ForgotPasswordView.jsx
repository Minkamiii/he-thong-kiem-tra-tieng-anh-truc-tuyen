// import './css/ForgotPasswordView.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Grid, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const ForgotPasswordView = () => {
    const navigate = useNavigate();

    const handleForgotPassword = (event) => {
        event.preventDefault();
        // Handle forgot password logic here
        navigate('/login');
    };

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <Grid
                item
                xs={false}
                sm={6}
                md={7}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5faff',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <HelpOutlineIcon sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
                    <Typography component="h1" variant="h3" fontWeight={700}>
                        Bruh Web
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Hệ thống kiểm tra Tiếng Anh trực tuyến
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={5} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4" fontWeight={700}>
                        Forgot Password
                    </Typography>
                    <Box component="form" onSubmit={handleForgotPassword} sx={{ mt: 2, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="retrieve-info"
                            label="Username/Email/Phone number"
                            name="retrieve-info"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600 }}
                        >
                            Reset Password
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2, py: 1.5 }}
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </Button>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default ForgotPasswordView;