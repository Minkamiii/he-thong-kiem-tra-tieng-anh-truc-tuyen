// import './css/RegisterView.css';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Paper, TextField, Button, Link } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';


const RegisterView = () => {
    const navigate = useNavigate();
    const [dateOfBirth, setDateOfBirth] = useState(null);

    const handleRegister = (event) => {
        event.preventDefault();
        // Perform registration logic here
        // Hardcoded for demonstration purposes
        const username = event.target.username.value;
        const password = event.target.password.value;
        const email = event.target.email.value;
        const phoneNumber = event.target.phoneNumber.value;
        const dateOfBirth = event.target.dateOfBirth.value;
        console.log('Registering with', { username, password, email, phoneNumber, dateOfBirth });
        // On successful registration, navigate to the desired route
        navigate('/login');
    };

    return (
        <Grid container component="main" sx={{height: '100vh'}}>
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
                <Box sx={{textAlign:'center'}}>
                    <PersonAddAltIcon sx={{fontSize:100, color:'#1976d2', mb:2}} />
                    <Typography component="h1" variant="h3" fontSize={70} fontWeight={700}>Bruh Web</Typography>
                    <Typography variant="h6" sx={{mt:2}} fontSize={24}>Online English practicing website</Typography>
                </Box>
            </Grid>
            <Grid item size={{xs:12, md:6}}
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
                        <Typography component="h1" variant="h5" fontWeight={700}>Đăng ký</Typography>
                        <Box component="form" noValidate onSubmit={handleRegister} sx={{mt:1}}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                id="password"
                                type="password"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="phoneNumber"
                                label="Phone Number"
                                name="phoneNumber"
                            />
                            <Box sx={{ mt: 2, mb:2 }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Date of Birth"
                                        value={dateOfBirth}
                                        onChange={setDateOfBirth}
                                        format="dd/MM/yyyy"
                                        slotProps={{
                                            textField: { fullWidth: true, required: true, name: 'dateOfBirth' }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{mt:1, mb:2, py:1.5, fontWeight:600}}
                            >Đăng ký</Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{mb:2, py:1.5}}
                                onClick={() => navigate('/login')}
                            >Back</Button>
                        </Box>
                    </Box>
                </Paper>
                <Box
                    sx={{
                        my:8, mx:4,
                        display:'flex',
                        flexDirection:'column',
                        alignItems:'center',
                    }}
                >
                    
                </Box>
            </Grid>
        </Grid>
    );
}

export default RegisterView;