import { Container, Tabs, Tab, Box, Typography, alpha } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AccountTree, LockOutlined, PersonAddOutlined } from '@mui/icons-material';

export default function AuthPage() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const tab = pathname.endsWith('register') ? 1 : 0;

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'stretch',
            }}
        >
            {/* Left decorative panel */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    flex: '0 0 45%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, #0D1117 0%, #0f1f14 50%, #0D1117 100%)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `
                            radial-gradient(ellipse 70% 60% at 50% 40%, rgba(76,175,125,0.2) 0%, transparent 70%),
                            radial-gradient(ellipse 40% 30% at 20% 70%, rgba(245,166,35,0.1) 0%, transparent 60%)
                        `,
                    },
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {/* Decorative grid */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(rgba(76,175,125,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(76,175,125,0.05) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }} />

                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 6 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 72,
                            height: 72,
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                            boxShadow: '0 0 40px rgba(76,175,125,0.45)',
                            mb: 3,
                            animation: 'float 3s ease-in-out infinite',
                            '@keyframes float': {
                                '0%, 100%': { transform: 'translateY(0)' },
                                '50%': { transform: 'translateY(-10px)' },
                            },
                        }}
                    >
                        <AccountTree sx={{ fontSize: 36, color: '#fff' }} />
                    </Box>

                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                            background: 'linear-gradient(135deg, #E6EDF3 0%, #81C99B 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            mb: 2,
                            lineHeight: 1.2,
                        }}
                    >
                        Your Family Story
                        <br />Starts Here
                    </Typography>

                    <Typography variant="body2" color="text.secondary" lineHeight={1.75} maxWidth={320}>
                        Join thousands of families preserving their history, connecting generations,
                        and discovering their roots with FamilyTree.
                    </Typography>

                    {/* Floating stat bubbles */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 5 }}>
                        {[
                            { value: '10K+', label: 'Families' },
                            { value: '500K+', label: 'Members' },
                        ].map((stat) => (
                            <Box
                                key={stat.label}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid rgba(76,175,125,0.25)',
                                    background: 'rgba(76,175,125,0.08)',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h6" fontWeight={700} color="primary.main">{stat.value}</Typography>
                                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Right form panel */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: { xs: 2, sm: 4 },
                    py: 6,
                    background: alpha('#161B22', 0.5),
                }}
            >
                <Container maxWidth="xs">
                    {/* Tab icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(76,175,125,0.2), rgba(46,125,82,0.2))',
                                border: '1px solid rgba(76,175,125,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'primary.main',
                            }}
                        >
                            {tab === 0 ? <LockOutlined /> : <PersonAddOutlined />}
                        </Box>
                    </Box>

                    <Typography variant="h5" fontWeight={700} textAlign="center" mb={0.5}>
                        {tab === 0 ? 'Welcome back' : 'Create account'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                        {tab === 0 ? 'Sign in to access your family tree' : 'Start building your family history today'}
                    </Typography>

                    <Tabs
                        value={tab}
                        onChange={(_, v) => navigate(v === 0 ? 'login' : 'register', { replace: true })}
                        sx={{ mb: 3 }}
                        centered
                    >
                        <Tab label="Sign In" />
                        <Tab label="Register" />
                    </Tabs>

                    <Box
                        sx={{
                            background: 'rgba(22,27,34,0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 3,
                            p: { xs: 3, sm: 4 },
                        }}
                    >
                        <Outlet />
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}