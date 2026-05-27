import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CircularProgress } from '@mui/material';
import { PATH_MY_TREE } from '@/router/routes';

export default function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(PATH_MY_TREE, { replace: true });
    }, [navigate]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
        </Container>
    );
}