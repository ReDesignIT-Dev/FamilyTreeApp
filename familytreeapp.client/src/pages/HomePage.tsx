import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, alpha } from '@mui/material';
import {
  AccountTree,
  PeopleAlt,
  Security,
  Share,
} from '@mui/icons-material';
import { useAppSelector } from '@/reduxComponents/hooks';
import { PATH_MY_TREE, PATH_AUTH_REGISTER, PATH_AUTH_LOGIN } from '@/router/routes';

const features = [
  {
    icon: <AccountTree sx={{ fontSize: 28 }} />,
    title: 'Interactive Tree',
    desc: 'Visualize your family connections in a beautiful, interactive tree diagram.',
  },
  {
    icon: <PeopleAlt sx={{ fontSize: 28 }} />,
    title: 'Rich Profiles',
    desc: 'Add detailed profiles with photos, dates, biographies and life events.',
  },
  {
    icon: <Security sx={{ fontSize: 28 }} />,
    title: 'Secure & Private',
    desc: 'Your family data is encrypted and only accessible to you.',
  },
  {
    icon: <Share sx={{ fontSize: 28 }} />,
    title: 'Share & Collaborate',
    desc: 'Invite family members to contribute and explore your shared history.',
  },
];

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
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '85vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 50% 0%, rgba(76,175,125,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 85% 30%, rgba(245,166,35,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 40% 50% at 10% 70%, rgba(76,175,125,0.07) 0%, transparent 60%)
            `,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Decorative grid lines */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(76,175,125,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(76,175,125,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            gap={3}
            sx={{ py: { xs: 8, md: 10 } }}
          >
            {/* Icon badge */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                boxShadow: '0 0 40px rgba(76,175,125,0.5), 0 16px 40px rgba(0,0,0,0.4)',
                animation: 'float 3s ease-in-out infinite',
                mb: 1,
              }}
            >
              <AccountTree sx={{ fontSize: 40, color: '#fff' }} />
            </Box>

            {/* Eyebrow */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 10,
                border: '1px solid rgba(76,175,125,0.3)',
                background: 'rgba(76,175,125,0.08)',
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF7D', boxShadow: '0 0 6px #4CAF7D' }} />
              <Typography variant="caption" sx={{ color: '#4CAF7D', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Your Family History, Reimagined
              </Typography>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                background: 'linear-gradient(135deg, #E6EDF3 0%, #81C99B 50%, #4CAF7D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Discover Your{' '}
              <Box component="span" sx={{ display: 'block' }}>
                Family Story
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: 520,
                fontWeight: 400,
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.125rem' },
              }}
            >
              Build, explore, and preserve your family history. Connect generations
              with beautiful profiles, life events, and interactive trees — all in one place.
            </Typography>

            <Box display="flex" gap={2} mt={1} flexWrap="wrap" justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(PATH_AUTH_REGISTER)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                  boxShadow: '0 4px 24px rgba(76,175,125,0.45)',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(76,175,125,0.6)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get Started — Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(PATH_AUTH_LOGIN)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: '#4CAF7D',
                    background: 'rgba(76,175,125,0.08)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(22,27,34,0.4)',
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Everything you need to
              {' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #4CAF7D, #F5A623)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                explore your roots
              </Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={480} mx="auto">
              A complete platform for building and sharing your family legacy with the people who matter most.
            </Typography>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={3}
          >
            {features.map((f, i) => (
              <Box
                key={f.title}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(28,33,40,0.6)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  animation: `fadeInUp 0.5s ease ${i * 0.1}s both`,
                  '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(24px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                  '&:hover': {
                    borderColor: alpha('#4CAF7D', 0.35),
                    background: alpha('#4CAF7D', 0.05),
                    transform: 'translateY(-4px)',
                    boxShadow: `0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px ${alpha('#4CAF7D', 0.2)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(76,175,125,0.2) 0%, rgba(46,125,82,0.2) 100%)',
                    color: '#4CAF7D',
                    mb: 2.5,
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.65}>
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}