import { Container, Typography, Tabs, Tab, Box } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function AuthPage() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const tab = pathname.endsWith('register') ? 1 : 0;

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Welcome
            </Typography>
            <Tabs value={tab} onChange={(_, v) => navigate(v === 0 ? 'login' : 'register')}>
                <Tab label="Login" />
                <Tab label="Register" />
            </Tabs>
            <Box sx={{ mt: 3 }}>
                <Outlet />
            </Box>
        </Container>
    );
}