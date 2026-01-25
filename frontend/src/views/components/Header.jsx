import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem, Tooltip, ListItemIcon } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({ isLoggedIn = false, user = null, /*onLogout*/ }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleGoProfile = () => {
        handleClose();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleClose();

        const data = {
            token: localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN),
        }

        axios.post(`${import.meta.env.VITE_BASE_AUTH_SERVICE_LINK}/logout`, data)
            .then(response => {
                localStorage.clear();
                console.log('a')

                navigate('/home');
                window.location.reload();
            })
            .catch(error => {
                console.log(error);
            })
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
                                    onClick={handleClick} 
                                    size="small" 
                                    sx={{ ml: 1 }} 
                                    aria-controls={open ? 'account-menu' : undefined} 
                                    aria-haspopup="true" 
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    <Avatar>
                                        <Typography fontSize={18}>
                                            {user?.username.charAt(0).toUpperCase()}
                                        </Typography>
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorEl={anchorEl}
                                id="account-menu"
                                open={open}
                                onClose={handleClose}
                                onClick={handleClose}
                                slotProps={{
                                    paper: {
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 0,
                                            '& .MuiAvatar-root': {
                                                width: 32,
                                                height: 32,
                                                ml: -0.5,
                                                mr: 1.5,
                                            },
                                        },
                                    },
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem onClick={handleGoProfile}>
                                    <Avatar /> Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
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