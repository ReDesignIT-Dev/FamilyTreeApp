import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Add } from '@mui/icons-material';
import { FamilyTreeService } from '@/services/api/familyTreeService';
import type { FamilyTree } from '@/types/familyTree.types';

export default function FamilyTreeDetailPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (treeId) {
      loadFamilyTree(treeId);
    }
  }, [treeId]);

  const loadFamilyTree = async (id: string) => {
    try {
      const data = await FamilyTreeService.getById(id);
      setTree(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family tree');
      console.error('Error fetching family tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/trees');
  };

  const handleEdit = () => {
    // TODO: Open edit dialog
    console.log('Edit tree');
  };

  const handleDelete = async () => {
    if (!treeId || !confirm('Are you sure you want to delete this family tree?')) {
      return;
    }

    try {
      await FamilyTreeService.delete(treeId);
      navigate('/trees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete family tree');
      console.error('Error deleting family tree:', err);
    }
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
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleBack}>
            Go Back
          </Button>
        }>
          {error || 'Tree not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          My Trees
        </Link>
        <Typography color="text.primary">{tree.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            {tree.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* Tree Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {tree.description || 'No description provided'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(tree.createdDate).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Tree Visualization Area */}
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