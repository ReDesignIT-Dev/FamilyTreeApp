import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { AccountTree, Add } from '@mui/icons-material';
export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Family Trees
        </Typography>
      </Box>

      <Card sx={{ textAlign: 'center', py: 6 }}>
        <CardContent>
          <AccountTree sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Family Trees Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start building your family history by creating your first family tree.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}