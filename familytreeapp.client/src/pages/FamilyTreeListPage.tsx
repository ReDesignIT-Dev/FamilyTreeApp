import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, AccountTree } from '@mui/icons-material';
import { FamilyTreeService } from '../services/api/familyTreeService';
import type { FamilyTree } from '../types/familyTree.types';

export default function FamilyTreeListPage() {
  const navigate = useNavigate();
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyTrees();
  }, []);

  const loadFamilyTrees = async () => {
    try {
      const data = await FamilyTreeService.getAll();
      setTrees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family trees');
      console.error('Error fetching family trees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // TODO: Open create dialog or navigate to create page
    console.log('Create new tree');
  };

  const handleViewTree = (treeId: number) => {
    navigate(`/trees/${treeId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Family Trees
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreateNew}>
          Create New Tree
        </Button>
      </Box>

      {trees.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <AccountTree sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Family Trees Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start building your family history by creating your first family tree.
            </Typography>
            <Button variant="contained" startIcon={<Add />} size="large" onClick={handleCreateNew}>
              Create Your First Tree
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {trees.map((tree) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tree.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {tree.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tree.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(tree.createdDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button fullWidth variant="outlined" onClick={() => handleViewTree(tree.id)}>
                    View Tree
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}