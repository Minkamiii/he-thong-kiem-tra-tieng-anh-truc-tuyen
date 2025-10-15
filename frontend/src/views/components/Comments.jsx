import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, Box, Typography, OutlinedInput, InputAdornment, IconButton, TextField } from "@mui/material";
import dayjs from "dayjs";
import { Send } from '@mui/icons-material';

const CommentItem = ({ comment }) => {

    return(
        <Box sx={{
            display: "flex", 
            flexDirection: "row",
            my: 1
        }}>
            <Box mr={1}>
                <Avatar sx={{bgcolor: "gray", width: 24, height: 24}}>
                    <Typography fontSize={14}>
                        K
                    </Typography>
                </Avatar>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1
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
            </Box>
        </Box>
    );
}

const CommentTextBox = () => {

    const [comment, setComment] = useState("");

    const handleCommentChange = (ev, value) => {
        setComment(value);
    }

    return(
        <Box sx={{
            width: "100%",
            my: 1,
        }}>
            <TextField fullWidth label="Comment" slotProps={{
                input: {
                    endAdornment: <InputAdornment position="end">
                        <IconButton >
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

    const [comment, setComment] = useState([]);
    const [totalComment, setTotalComment] = useState(0);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_COMMENT_SERVICE_LINK}/${testId}`)
            .then(res => {
                setComment(res.data.comments);
            })
            .catch(error => {
                console.error(error);
            })
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
            <CommentTextBox />
            {comment.map(item => {

                return(
                    <>
                        <CommentItem comment={item} />
                        {item.replies.length > 0 && item.replies.map(reply => {
                            return(
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "left",
                                    alignSelf: "start",
                                    width: "100%",
                                    ml: 5
                                }}>
                                    <CommentItem comment={reply} />
                                </Box>
                            );
                        })}
                    </>
                );
            })}
        </Box>
    );
}

export default Comment;