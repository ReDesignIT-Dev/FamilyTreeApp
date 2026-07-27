import { useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, Toolbar, Typography, alpha } from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { PATH_HOME, PATH_MY_TREE } from '@/router/routes';
import { useAppSelector } from '@/reduxComponents/hooks';
import AccountMenu from './AccountMenu';

export default function Header() {
    const navigate = useNavigate();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

    return (
        <AppBar position="sticky" elevation={0}>
            <Toolbar sx={{ gap: 0.5, minHeight: { xs: 60, sm: 64 } }}>
                {/* Logo */}
                <Button
                    color="inherit"
                    onClick={() => navigate(PATH_HOME, { replace: true })}
                    sx={{
                        gap: 1,
                        px: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                            background: alpha('#4CAF7D', 0.1),
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                            boxShadow: '0 2px 8px rgba(76,175,125,0.4)',
                        }}
                    >
                        <AccountTree sx={{ fontSize: 18, color: '#fff' }} />
                    </Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{
                            background: 'linear-gradient(135deg, #E6EDF3 0%, #81C99B 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        FamilyTree
                    </Typography>
                </Button>

                {/* Nav Links */}
                {isLoggedIn && (
                    <Button
                        onClick={() => navigate(PATH_MY_TREE, { replace: true })}
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            borderRadius: 2,
                            px: 1.5,
                            '&:hover': {
                                color: 'text.primary',
                                background: 'rgba(255,255,255,0.06)',
                            },
                        }}
                    >
                        My Tree
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <AccountMenu />
            </Toolbar>
        </AppBar>
    );
}