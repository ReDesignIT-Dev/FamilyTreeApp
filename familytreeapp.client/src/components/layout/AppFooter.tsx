import { Box, Container, Typography } from '@mui/material';
import { AccountTree } from '@mui/icons-material';

export default function AppFooter() {
    const year = new Date().getFullYear();
    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(13,17,23,0.8)',
                backdropFilter: 'blur(10px)',
                py: 3,
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                            }}
                        >
                            <AccountTree sx={{ fontSize: 14, color: '#fff' }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(230,237,243,0.6)' }}>
                            FamilyTree
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.disabled">
                        Copyright {year} FamilyTree App
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
