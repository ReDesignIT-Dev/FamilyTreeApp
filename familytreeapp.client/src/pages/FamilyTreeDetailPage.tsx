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

interface FamilyTree {
  id: number;
  name: string;
  description?: string;
  createdDate: string;
  userId: string;
}

export default function FamilyTreeDetailPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (treeId) {
      fetchFamilyTree(treeId);
    }
  }, [treeId]);

  const fetchFamilyTree = async (id: string) => {
    try {
      const response = await fetch(`/api/familytrees/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTree(data);
      } else {
        setError('Family tree not found');
      }
    } catch (error) {
      console.error('Error fetching family tree:', error);
      setError('Failed to load family tree');
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
      const response = await fetch(`/api/familytrees/${treeId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        navigate('/trees');
      }
    } catch (error) {
      console.error('Error deleting family tree:', error);
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
          <Typography variant="body1" color="text.secondary" paragraph>
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