import React from "react";
import BaseUI from "./components/BaseUI";
import { Avatar, Box, Typography } from "@mui/material";

const UserProfileView = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

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

    return (
        <BaseUI isLoggedIn={isLoggedIn} user={user}>
            <Box>
                <Avatar>
                    <Typography>

                    </Typography>
                </Avatar>
            </Box>
        </BaseUI>
    );
}

export default UserProfileView;