// import './css/LoginView.css';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Paper, TextField, Button, Link, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import { useEffect, useState } from 'react';

const LoginView = () => {

    const navigate = useNavigate();
    const [usernameValid, setUsernameValid] = useState({
        ok: true,
        message: "",
    });
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        // Perform login logic here
        // Hardcoded for demonstration purposes
        const username = event.target.username.value;
        const password = event.target.password.value;

        const data = {
            username: username,
            password: password
        }

        axios.post(`${import.meta.env.VITE_BASE_AUTH_SERVICE_LINK}/login`, data)
            .then(response => {
                const result = response.data.result;
                
                localStorage.setItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN, result.accessToken);
                localStorage.setItem(import.meta.env.VITE_LOCAL_STORAGE_REFRESH_TOKEN, result.refreshToken);
                localStorage.setItem(import.meta.env.VITE_LOCAL_STORAGE_USER_ID, result.userId);

                alert('Login successfully!');
                navigate('/home');
            })
            .catch(error => {
                const data = error.response.data;
                setUsernameValid({
                    ok: false,
                    message: data.message
                })
            })

    };

    return (
        <div>
            <Grid container component="main" sx={{ 
                height: '100vh'
            }}>
                {/* Left branding area */}
                <Grid
                    item
                    size={{xs:12, md:6}}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: { xs: 4, md: 4 },
                    }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 100, color:'#1976d2', mb: 2 }} />
                    <Typography component="h1" variant="h3" fontSize={70} fontWeight={600} sx={{ mb: 2 }}>
                        Bruh Web
                    </Typography>
                    <Typography variant="h6" fontSize={24}>
                        Online English practicing website
                    </Typography>
                </Grid>
                {/* Right login form */}
                <Grid
                    item
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
                            <Typography component="h1" variant="h5" fontSize={32} fontWeight={700} sx={{mb:1}}>
                                Sign In
                            </Typography>
                            <Box component="form" onSubmit={handleLogin} sx={{width:'100%'}}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                    sx={{mb:1}}
                                    error={!usernameValid.ok}
                                    helperText={!usernameValid.ok && usernameValid.message}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={passwordVisible ? "text" : "password"}
                                    id="password"
                                    autoComplete="current-password"
                                    sx={{mb:3}}
                                    slotProps={{
                                        input:{
                                            endAdornment: <InputAdornment>
                                                <IconButton>
                                                    {passwordVisible ? 
                                                        <VisibilityOff onClick={() => setPasswordVisible(false)} /> : 
                                                        <Visibility onClick={() => setPasswordVisible(true)} />
                                                    }
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ py: 1.25, fontWeight: 600, fontSize: '20px', mb: 2 }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{mb:2, py:1.5, fontWeight: 600, fontSize: '20px'}}
                                    onClick={() => navigate('/home')}
                                >Back</Button>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Link 
                                        component="button"
                                        variant="body2"
                                        onClick={() => navigate('/forgot-password')}
                                        // xs={4} md={1}
                                        sx={{ fontSize: '20px', fontWeight: 'bold' }}
                                        underline='none'
                                    >
                                        Forgot password?
                                    </Link>
                                    <Link 
                                        component="button"
                                        variant="body2"
                                        onClick={() => navigate('/register')}
                                        //xs={4} md={2}
                                        sx={{ fontSize: '20px', fontWeight: 'bold' }}
                                        underline='none'
                                    >
                                        New User?
                                    </Link>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </div>
        
    );
}

export default LoginView;