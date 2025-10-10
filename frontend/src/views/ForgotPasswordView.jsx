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
                size={{xs:12, md:6}}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#fff',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <HelpOutlineIcon sx={{ fontSize: 100, color: '#1976d2', mb: 2 }} />
                    <Typography component="h1" variant="h3" fontSize={70} fontWeight={700}>Bruh Web</Typography>
                    <Typography variant="h6" sx={{mt:2}} fontSize={24}>Online English practicing website</Typography>
                </Box>
            </Grid>
            <Grid item 
                size={{xs:12, md:6}}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: { xs: 4, md: 4 },
                }}
            >
                <Paper
                    elevation={3} 
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            display:'flex',
                            flexDirection:'column',
                            alignItems:'center',
                        }}
                    >
                        <Typography component="h1" variant="h5" fontWeight={700}>
                            Quên mật khẩu
                        </Typography>
                        <Box component="form" onSubmit={handleForgotPassword} sx={{ mt: 2, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="retrieve-info"
                                label="Username/Email/Số điện thoại"
                                name="retrieve-info"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600 }}
                            >
                                Reset
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 2, py: 1.5 }}
                                onClick={() => navigate('/login')}
                            >
                                Back
                            </Button>
                        </Box>
                    </Box>
                </Paper>
                
            </Grid>
        </Grid>
    );
};

export default ForgotPasswordView;