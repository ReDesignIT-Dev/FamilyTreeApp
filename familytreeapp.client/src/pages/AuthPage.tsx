import { Container, Typography } from '@mui/material';
import LoginFormComponent from '@/components/auth/LoginFormComponent';
export default function AuthPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4">Login / Register</Typography>
          <LoginFormComponent />
    </Container>
  );
}