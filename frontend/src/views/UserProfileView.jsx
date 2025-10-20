import React, { useState, useEffect } from "react";
import BaseUI from "./components/BaseUI";
import { Box, Avatar, Typography, TextField, IconButton, Button, Stack, Card, CardContent } from "@mui/material";
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import authApi from "../api/AuthApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditingField = {
    email: "email",
    phone: "phone"
}

const UserProfileView = () => {
    
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    useEffect(() => {

        if(localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)){
            authApi.post('/introspect', {
                token: localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)
            }).then(res => {
                if(!user){
                    axios.get(`${import.meta.env.VITE_BASE_USER_SERVICE_LINK}/${localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_ID)}`)
                    .then(res => {
                        setUser(res.data.result);
                        setIsLoggedIn(true);
                    })
                    .catch(err => {
                        alert("Can not find user. Please login again.");
                        navigate("/home");
                    })
                }
            }).catch(err => {
                console.log(err);
                alert("Login session expired. Please login again.");
                navigate("/home");
            })
        }
        
    }, [])
    
    console.log(user);

    const handleEdit = (field) => {
        setEditingField(field);
    };

    const handleChange = (field, value) => {
        
    };

    const handleSave = (field) => {
        console.log("Saved:", field, tempValues[field]); // call API update ở đây
        setEditingField(null);
    };

    const handleCancel = () => {
        
        setEditingField(null);
    };

    const avatarLetter = user?.username ? user.username.charAt(0).toUpperCase() : "?";

    return (
        <BaseUI isLoggedIn={isLoggedIn} user={user}>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Card sx={{ p: 4, width: 400, borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                        <Stack alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
                                <Typography variant="h5" color="white">
                                    {avatarLetter}
                                </Typography>
                            </Avatar>

                            <Typography variant="h6">{user?.username || "Unknown User"}</Typography>
                        </Stack>

                        <Box mt={4}>
                            {/* Email */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                    Email
                                </Typography>
                                {editingField === "email" ? (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <TextField
                                            size="small"
                                            value={email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                        />
                                        <IconButton color="success" onClick={() => handleSave("email")}>
                                            <SaveIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={handleCancel}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Stack>
                                ) : (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography>{email}</Typography>
                                        <IconButton size="small" onClick={() => handleEdit("email")}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )}
                            </Stack>

                            {/* Phone */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                    Phone Number
                                </Typography>
                                {editingField === "phone" ? (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <TextField
                                            size="small"
                                            value={phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                        />
                                        <IconButton color="success" onClick={() => handleSave("phone")}>
                                            <SaveIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={handleCancel}>
                                            <CloseIcon />
                                        </IconButton>
                                    </Stack>
                                ) : (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography>{phone}</Typography>
                                        <IconButton size="small" onClick={() => handleEdit("phone")}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                )}
                            </Stack>
                        </Box>

                        <Box mt={4} textAlign="center">
                            <Button variant="contained">
                                Save
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </BaseUI>
    );
}

export default UserProfileView;