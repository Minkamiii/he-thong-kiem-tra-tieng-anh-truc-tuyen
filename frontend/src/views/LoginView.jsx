// import './css/LoginView.css';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Paper, TextField, Button, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginView = () => {

    const navigate = useNavigate();

    const handleLogin = (event) => {
        event.preventDefault();
        // Perform login logic here
        // Hardcoded for demonstration purposes
        const username = event.target.username.value;
        const password = event.target.password.value;
        // Hardcoded users for demonstration purposes
        if (username === 'admin' && password === 'admin') {
            alert('Admin login successful!');
            navigate('/admin');
            return;
        }
        else if (username === 'teacher' && password === 'teacher') {
            alert('Teacher login successful!');
            navigate('/home', {isLoggedIn: true, user: { id: '1', avatar: 'https://i.pravatar.cc/300' }});
            return;
        }
        else if (username === 'student' && password === 'student') {
            alert('Student login successful!');
            navigate('/home', {isLoggedIn: true, user: { id: '2', avatar: 'https://i.pravatar.cc/300' }});
            return;
        }
        alert('Login failed! Incorrect username or password.');
        // On successful login, navigate to the desired route
        //navigate('/dashboard');
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
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    sx={{mb:3}}
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