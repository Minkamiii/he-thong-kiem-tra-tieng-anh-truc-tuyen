import { useEffect, useState } from "react";
import axios from "axios";
import { 
    Avatar, 
    Box, 
    Typography, 
    InputAdornment, 
    IconButton, 
    TextField, 
    Menu, 
    MenuItem, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle, 
    Button 
} from "@mui/material";
import dayjs from "dayjs";
import { Send, MoreVert } from '@mui/icons-material';
import authApi from "../../api/AuthApi";
import { useNavigate } from "react-router-dom";

const Introspect = async () => {

    if (localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN)) {

        try {
            const token = localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN);
            const userId = localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_USER_ID);

            if (!token) {
                return { user: null, isLoggedIn: false };
            }

            await authApi.post("/introspect", { token });

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_USER_SERVICE_LINK}/${userId}`
            );

            return {
                user: res.data.result,
                isLoggedIn: true,
            };
        } 
        catch (err) {
            return { user: null, isLoggedIn: false };
        }
    }
}

const CommentItem = ({ testId, comment, depth, user }) => {

    const [isReplying, setIsReplying] = useState(false);
    const [isEditting, setIsEditting] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    
    const open = Boolean(anchorEl);

    console.log("isedit", isEditting);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEdit = () => {
        setIsEditting(true);
    }

    const handleDelete = async () => {
        handleCloseDialog();

        const introspect = await Introspect();
        if (!introspect.isLoggedIn && !introspect.user) {
            alert("Login session has expired. Please login again!");
            navigate("/home");
            return;
        }

        const response = await axios.delete(`${import.meta.env.VITE_BASE_COMMENT_SERVICE_LINK}/${comment.commentId}`);

        if(response.status !== 204){
            console.log(response);
        }
        else{
            alert("Comment deleted successfully!");
            handleClose();
            window.location.reload();
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const handleOpenDialog = () => {
        setOpenDialog(true);
    }

    return(
        <Box sx={{
            display: "flex", 
            flexDirection: "row",
            my: 1,
            ml: depth * 5,
        }}>
            <Box mr={1}>
                <Avatar sx={{bgcolor: "gray", width: 30, height: 30}}>
                    <Typography fontSize={14}>
                        A
                    </Typography>
                </Avatar>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
            }}>
                <Box sx={{
                    flexShrink: 1,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    gap: 1,
                }}>
                    <Typography>
                        <strong>
                            {comment.userId}
                        </strong>
                        {` ,${dayjs(comment.createdAt, "DD/MM/YYYY HH:mm:ss").format("DD MMM. YYYY")}`}
                    </Typography>
                    <Typography>
                        {comment.content}
                    </Typography>
                    {depth < 1 &&
                        <Typography
                            component="button"
                            onClick={() => {
                                setIsReplying(!isReplying);
                            }}
                            sx={{
                                ":hover": {
                                    cursor: "pointer",
                                    color: "#151c82"
                                },
                                color: "#2b34ba",
                                fontWeight: "bold",
                                px: 0.5,
                                width: "0%",
                                bg: "none",
                                border: "none",
                                bgcolor: "transparent"
                            }}>
                            Reply
                        </Typography>}
                    {(isReplying || isEditting) && 
                        <CommentTextBox 
                            testId={testId} 
                            parentId={comment.commentId} 
                            initialComment={isEditting ? comment.content : ""} i
                            isEditting={isEditting}
                        />
                    }
                </Box>
                {user.id === comment.userId && 
                <IconButton
                    onClick={handleClick}
                    sx={{
                        flexShrink: 0
                    }}
                >
                    <MoreVert />
                </IconButton>}
                <Menu
                    anchorEl={anchorEl}
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
                    <MenuItem onClick={handleEdit}>
                        <Typography>Edit</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleOpenDialog}>
                        <Typography>Delete</Typography>
                    </MenuItem>
                </Menu>
            </Box>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle id="submit-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this comment?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{mb: 1}}>
                    <Button onClick={handleCloseDialog}>Back</Button>
                    <Button onClick={handleDelete} autoFocus variant="contained">OK</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

const CommentTextBox = ({testId, parentId=null, initialComment = "", isEditting = false}) => {

    const navigate = useNavigate();
    const [comment, setComment] = useState(initialComment);
    const [error, setError] = useState(false);

    const handleCommentChange = (ev) => {
        const value = ev.target.value;
        setError(false);
        setComment(value);
    }

    const handleAddComment = async (ev) => {
        if(comment===""){
            setError(true);
        }else{
            setError(false);

            const introspect = await Introspect();
            if(!introspect.isLoggedIn && !introspect.user){
                alert("Login session has expired. Please login again!");
                navigate("/home");
                return;
            }

            try{

                if(isEditting){
                    const data = {
                        content: comment,
                    }

                    const response = await axios.put(`${import.meta.env.VITE_BASE_COMMENT_SERVICE_LINK}/${parentId}`, data);

                    if(response.status !== 200){
                        console.log(response);
                    }
                    else{
                        alert("Comment edited successfully!");
                        window.location.reload();
                    }
                }
                else{
                    const data = {
                        testId,
                        content: comment,
                        userId: introspect.user.id
                    }
                    if (parentId) {
                        data.parentId = parentId;
                    }

                    const response = await axios.post(`${import.meta.env.VITE_BASE_COMMENT_SERVICE_LINK}`, data);

                    if (response.status !== 201) {
                        console.log(response);
                    }
                    else {
                        alert("Comment added successfully!");
                        window.location.reload();
                    }
                }

                setComment("");
            }
            catch(error){
                console.error(error);
            }
        }
    }

    return(
        <Box sx={{
            width: "100%",
            my: 1,
        }}>
            <TextField 
                fullWidth 
                error={error} 
                value={comment} 
                helperText={error && "Comment cannot be empty"} 
                onChange={handleCommentChange} 
                label="Comment" 
                slotProps={{
                    input: {
                        endAdornment: <InputAdornment position="end">
                            <IconButton onClick={handleAddComment}>
                                <Send />
                            </IconButton>
                        </InputAdornment>
                    }
                }} >
                
            </TextField>
        </Box>
    );
}

const Comment = ({ testId }) => {

    const navigate = useNavigate();
    const [comment, setComment] = useState([]);
    const [totalComment, setTotalComment] = useState(0);
    const [user, setUser] = useState(null);

    useEffect(() => {

        async function fetchComment(){
            const introspect = await Introspect();
            if (!introspect.isLoggedIn && !introspect.user) {
                alert("Login session has expired. Please login again!");
                navigate("/home");
            }
            setUser(introspect.user);

            axios.get(`${import.meta.env.VITE_BASE_COMMENT_SERVICE_LINK}/${testId}`)
                .then(res => {
                    setComment(res.data.comments);
                    setTotalComment(res.data.totalComment);
                })
                .catch(error => {
                    console.error(error);
                })
        }

        fetchComment();

    }, []) 

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "left",
            alignSelf: "start",
            width: "100%",
            mt: 2, ml: 1
        }}>
            <CommentTextBox testId={testId}/>
            {comment.length > 0 ? comment.map(item => {

                return(
                    <>
                        <CommentItem testId={testId} comment={item} depth={0} user={user}/>
                        {item.replies.length > 0 && item.replies.map(reply => {
                            return(
                                <CommentItem testId={testId} comment={reply} depth={1} user={user}/>
                            );
                        })}
                    </>
                );
            }) : <Typography sx={{alignSelf: "center", my: 2}}>No comments yet</Typography>}
        </Box>
    );
}

export default Comment;