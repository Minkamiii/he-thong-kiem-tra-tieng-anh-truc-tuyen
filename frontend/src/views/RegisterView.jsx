// import './css/RegisterView.css';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Paper, TextField, Button, Link, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const RegisterView = () => {
    const navigate = useNavigate();
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [samePassword, setSamePassword] = useState(true);
    const [userValid, setuserValid] = useState({
        ok: true,
        message: "",
    });
    const [passwordValid, setPasswordValid] = useState({
        ok: true,
        message: "",
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        const controller = new AbortController();
        // Perform registration logic here
        // Hardcoded for demonstration purposes
        const username = event.target.username.value;
        const password = event.target.password.value;
        const confirm = event.target.confirm.value;
        const email = event.target.email.value;
        const phoneNumber = event.target.phoneNumber.value;
        const dateOfBirth = dayjs(event.target.dateOfBirth.value, 'DD/MM/YYYY').format('YYYY-MM-DD');

        if(password!==confirm){
            setSamePassword(false);
            return;
        }
        else{
            setSamePassword(true);
        }

        const data = {
            username: username,
            password: password,
            email: email,
            phoneNum: phoneNumber,
            dob: dateOfBirth,
            roles: []
        }

        axios
            .post(`${import.meta.env.VITE_BASE_USER_SERVICE_LINK}/register`, data, {signal: controller.signal})
            .then((response) => {
                navigate('/login');
                alert("Register successfully!");
            })
            .catch((error) => {
                const data = error.response.data;
                switch(data.code){
                    case 1001:
                        setuserValid({
                            ok: false,
                            message: data.message,
                        });
                        break;
                    case 1002:
                        setPasswordValid({
                            ok: false,
                            message: data.message,
                        });
                        break;
                }
            })
    };

    const handleConfirmChange = () => {
        if(!samePassword) setSamePassword(true);
    }

    const handlePasswordChange = () => {
        if(!passwordValid.ok) setPasswordValid({
            ok: true,
            message: "",
        })
    }

    const handleUsernameChange = () => {
        if(!userValid.ok) setuserValid({
            ok: true,
            message: "",
        })
    }

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
                    py: { xs: 2, md: 2 },
                }}
            >
                <Paper 
                    elevation={3} 
                    sx={{
                        px: 4,
                        py: 2,
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
                        <Typography component="h1" variant="h5" fontWeight={700}>Register User</Typography>
                        <Box component="form" noValidate onSubmit={handleRegister} sx={{mt:1}}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                error={!userValid.ok}
                                helperText={!userValid.ok && userValid.message}
                                onChange={handleUsernameChange}
                                label="Username"
                                name="username"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                error={!passwordValid.ok}
                                helperText={!passwordValid.ok && passwordValid.message}
                                onChange={handlePasswordChange}
                                label="Password"
                                id="password"
                                type={passwordVisible ? 'text' : 'password'}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position='end'>
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
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirm"
                                label="Confirm Password"
                                error={!samePassword}
                                helperText={!samePassword ? 'Passwords do not match' : ''}
                                onChange={handleConfirmChange}
                                id="confirm"
                                type={confirmVisible ? 'text' : 'password'}
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position='end'>
                                            <IconButton>
                                                {confirmVisible ? 
                                                    <VisibilityOff onClick={() => setConfirmVisible(false)} /> : 
                                                    <Visibility onClick={() => setConfirmVisible(true)} />
                                                }
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                }}
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
                            <Grid container spacing={2} sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{mb:2, py:1.5, fontWeight:600, width: "40%"}}
                                >Register</Button>
                                <Button
                                    variant="outlined"
                                    sx={{mb:2, py:1.5, width: "40%"}}
                                    onClick={() => navigate('/login')}
                                >Back</Button>
                            </Grid>
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