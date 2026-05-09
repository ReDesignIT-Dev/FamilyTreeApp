import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent,
  CircularProgress, Alert,
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import { FamilyTreeService } from '@/services/api/familyTreeService';
import type { FamilyTree } from '@/types/familyTree.types';

export default function FamilyTreeDetailPage() {
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    FamilyTreeService.getMine()
      .then((data) => setTree(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load family tree'))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    // TODO: Open edit dialog
    console.log('Edit tree');
  };

  const handleAddMember = () => {
    // TODO: Open add member dialog
    console.log('Add family member');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !tree) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Tree not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {tree.name}
        </Typography>
        <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
          Edit
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {tree.description || 'No description provided'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(tree.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Family Members</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddMember}>
              Add Member
            </Button>
          </Box>
          <Box sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Tree visualization will be implemented here
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}