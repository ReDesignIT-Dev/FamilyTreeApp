import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CircularProgress } from '@mui/material';
import { FamilyTreeService } from '@/services/api/familyTreeService';
import { PATH_TREE_DETAIL } from '@/router/routes';

export default function FamilyTreeListPage() {
    const navigate = useNavigate();

    useEffect(() => {
        FamilyTreeService.getMine()
            .then((tree) => navigate(PATH_TREE_DETAIL(String(tree.id)), { replace: true }))
            .catch(() => navigate('/', { replace: true }));
    }, [navigate]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
            <CircularProgress />
        </Container>
    );
}