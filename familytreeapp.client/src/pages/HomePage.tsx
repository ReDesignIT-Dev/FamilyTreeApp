import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { useAppSelector } from '@/reduxComponents/hooks';
import { PATH_MY_TREE, PATH_AUTH_REGISTER, PATH_AUTH_LOGIN } from '@/router/routes';

export default function HomePage() {
    const navigate = useNavigate();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

    useEffect(() => {
        if (isLoggedIn) {
            navigate(PATH_MY_TREE, { replace: true });
        }
    }, [isLoggedIn, navigate]);

    if (isLoggedIn) return null;

    return (
        <Container maxWidth="md">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                gap={3}
                sx={{ mt: 10 }}
            >
                <AccountTree sx={{ fontSize: 72, color: 'primary.main' }} />

                <Typography variant="h3" fontWeight={700}>
                    Welcome to Family Tree App
                </Typography>

                <Typography variant="h6" color="text.secondary" maxWidth={520}>
                    Discover, build, and share your family history. Create a family tree,
                    add members, and explore your roots — all in one place.
                </Typography>

                <Box display="flex" gap={2} mt={2}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(PATH_AUTH_REGISTER)}
                    >
                        Get Started — Register
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate(PATH_AUTH_LOGIN)}
                    >
                        Sign In
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}