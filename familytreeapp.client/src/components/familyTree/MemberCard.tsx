import { Avatar, Box, Typography, Chip, alpha } from '@mui/material';
import type { PersonSummaryDto } from '@/types/familyTree.types';
import { useNavigate } from 'react-router-dom';
import { PATH_MEMBER_DETAIL } from '@/router/routes';
import { CakeOutlined } from '@mui/icons-material';

interface Props {
  member: PersonSummaryDto;
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export default function MemberCard({ member }: Readonly<Props>) {
  const navigate = useNavigate();

  const firstName = safeText(member.firstName);
  const lastName = safeText(member.lastName);
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown member';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

  const birthDate = formatDate(member.birthDate);
  const deathDate = formatDate(member.deathDate);

  return (
    <Box
      onClick={() => navigate(PATH_MEMBER_DETAIL(String(member.id)))}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(28,33,40,0.7)',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          borderColor: alpha('#4CAF7D', 0.4),
          background: alpha('#4CAF7D', 0.05),
          transform: 'translateY(-3px)',
          boxShadow: `0 12px 36px rgba(0,0,0,0.35), 0 0 0 1px ${alpha('#4CAF7D', 0.2)}`,
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          src={member.profilePhotoUrl ?? undefined}
          sx={{
            width: 52,
            height: 52,
            fontSize: '1.1rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
            boxShadow: '0 4px 12px rgba(76,175,125,0.35)',
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            noWrap
            sx={{ mb: 0.5, color: 'text.primary' }}
          >
            {displayName}
          </Typography>

          {birthDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CakeOutlined sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                {birthDate}
              </Typography>
            </Box>
          )}

          {deathDate && (
            <Chip
              label="Deceased"
              size="small"
              sx={{
                mt: 0.75,
                height: 20,
                fontSize: '0.65rem',
                bgcolor: alpha('#8B949E', 0.1),
                color: '#8B949E',
                border: '1px solid rgba(139,148,158,0.2)',
                fontWeight: 500,
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}