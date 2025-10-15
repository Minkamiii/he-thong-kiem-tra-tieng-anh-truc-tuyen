import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '../states/UserSlice.jsx';

const Header = ({ isLoggedIn = false, user = null, /*onLogout*/ }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [anchorElements, setAnchorElements] = useState(null);
    const isMenuOpen = Boolean(anchorElements);

    const handleAvatarClick = (event) => {
        setAnchorElements(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorElements(null);
    };

    const handleGoProfile = () => {
        handleMenuClose();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleMenuClose();

        const data = {
            token: localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_REFRESH_TOKEN),
        }

        axios.post(`${import.meta.env.VITE_BASE_AUTH_SERVICE_LINK}/logout`, data)
            .then(response => {
                dispatch(setLoggedIn({isLoggedIn: false}));

                localStorage.removeItem(import.meta.env.VITE_LOCAL_STORAGE_REFRESH_TOKEN);
                localStorage.removeItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN);
                localStorage.removeItem(import.meta.env.VITE_LOCAL_STORAGE_USER_ID);

                navigate('/login');
            })
            .catch(error => {
                console.log(error);
            })
        // }
    };

    return (
        <AppBar position="static" sx={{ bgcolor: '#6BB0FE', boxShadow: 0 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => navigate('/home')}
                >
                    <MenuBookIcon sx={{ fontSize: 32, color: '#222' }} />
                    <Typography variant="h5" sx={{ fontFamily: 'Dancing Script, cursive', color: '#222' }}>
                        Bruh Web
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isLoggedIn ? (
                        <>
                            <Button color="inherit" cursor="pointer" onClick={() => navigate('/test/?page=1')}>Test</Button>
                            <Button color="inherit" cursor="pointer" onClick={() => navigate('/history')}>History</Button>
                            <Tooltip title={user?.username || 'Account'}>
                                <IconButton 
                                    onClick={handleAvatarClick} 
                                    size="small" 
                                    sx={{ ml: 1 }} 
                                    aria-controls={isMenuOpen ? 'account-menu' : undefined} 
                                    aria-haspopup="true" 
                                    aria-expanded={isMenuOpen ? 'true' : undefined}
                                >
                                    <Avatar>
                                        <Typography fontSize={18}>
                                            {user?.username.charAt(0).toUpperCase()}
                                        </Typography>
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorElements={anchorElements}
                                id="account-menu"
                                open={isMenuOpen}
                                onClose={handleMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                            >
                                <MenuItem onClick={handleGoProfile}>Profile</MenuItem>
                                <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                                Login
                            </Button>
                            <Button variant="outlined" color="primary" onClick={() => navigate('/register')}>
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
    
}

export default Header;