import React from "react";
import { Box, Container } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

const BaseUI = ({ isLoggedIn = false, user = null, children }) => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f7ff', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Header isLoggedIn={isLoggedIn} user={user} />

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ flex: 1, py: 6 }}>
                {children}
            </Container>

            {/* Footer */}
            <Footer />
        </Box>
    );
}

export default BaseUI;