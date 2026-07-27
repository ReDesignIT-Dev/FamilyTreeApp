import React from "react";
import { Box, Typography, Button, alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Home } from "@mui/icons-material";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 64px)",
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 60% at 50% 40%, rgba(76,175,125,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(245,166,35,0.07) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        },
      }}
    >
      <Box textAlign="center" sx={{ position: 'relative', zIndex: 1, px: 3 }}>
        {/* Large 404 */}
        <Typography
          component="div"
          sx={{
            fontSize: { xs: '6rem', sm: '9rem', md: '12rem' },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            background: 'linear-gradient(135deg, rgba(76,175,125,0.5) 0%, rgba(76,175,125,0.15) 50%, rgba(245,166,35,0.3) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1,
            userSelect: 'none',
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 1.5,
            background: 'linear-gradient(135deg, #E6EDF3 0%, #8B949E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 380, mx: 'auto', lineHeight: 1.7 }}
        >
          The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate("/")}
          sx={{
            px: 4,
            background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
            boxShadow: `0 4px 20px ${alpha('#4CAF7D', 0.4)}`,
            '&:hover': {
              boxShadow: `0 8px 32px ${alpha('#4CAF7D', 0.55)}`,
              transform: 'translateY(-2px)',
            },
          }}
        >
          Go Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
