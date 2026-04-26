import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { PATH_TREE_DETAIL } from '@/router/routes';
import { FamilyTreeService } from '@/services/api/familyTreeService';

export default function CreateTreePage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const newTree = await FamilyTreeService.create({ name, description });
            navigate(PATH_TREE_DETAIL(String(newTree.id)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create family tree');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create New Family Tree
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Tree Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    disabled={loading}
                />
                <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={loading}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Create Tree'}
                    </Button>
                    <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}