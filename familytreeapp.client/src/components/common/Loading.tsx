import { Box, CircularProgress, Typography } from '@mui/material';
import { AccountTree } from '@mui/icons-material';

export default function Loading() {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight={240}
            gap={2.5}
        >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                    size={56}
                    thickness={2}
                    sx={{
                        color: '#4CAF7D',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        },
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <AccountTree sx={{ fontSize: 22, color: '#4CAF7D', opacity: 0.8 }} />
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Loading...
            </Typography>
        </Box>
    );
}
