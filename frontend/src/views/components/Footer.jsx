import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();
    return (
        <Box component="footer" sx={{ bgcolor: '#D9D9D9', py: 4, mt: 'auto' }}>
            <Container maxWidth="xl">
                <Grid container spacing={4}>
                    <Grid item size={{xs:12, md:3}}>
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2, 
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                            }}
                            onClick={() => navigate('/home')}
                        >
                            <MenuBookIcon sx={{ fontSize: 32, color: '#222', mr: 1 }} />
                            <Typography variant="h6" color="#222">Bruh Web</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Link href="#" color="#222"><i className="fa-brands fa-facebook"></i></Link>
                            <Link href="#" color="#222"><i className="fa-brands fa-instagram"></i></Link>
                            <Link href="#" color="#222"><i className="fa-brands fa-x-twitter"></i></Link>
                            <Link href="#" color="#222"><i className="fa-brands fa-youtube"></i></Link>
                            <Link href="#" color="#222"><i className="fa-brands fa-linkedin"></i></Link>
                        </Box>
                    </Grid>
                    {/* <Grid item size={{xs:12, md:3}}>
                        <Typography variant="subtitle1" fontWeight={700}>Services</Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            <li><Link href="#">User Service</Link></li>
                            <li><Link href="#">Service 2</Link></li>
                            <li><Link href="#">Service 3</Link></li>
                        </Box>
                    </Grid> */}
                    {/* Add more columns as needed */}
                </Grid>
            </Container>
        </Box>
    );
}

export default Footer;