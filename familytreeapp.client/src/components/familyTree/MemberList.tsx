import { Box, Typography, alpha } from '@mui/material';
import { PeopleAlt } from '@mui/icons-material';
import type { PersonSummaryDto } from '@/types/familyTree.types';
import MemberCard from './MemberCard';

interface Props {
  members: readonly PersonSummaryDto[];
}

export default function MemberList({ members }: Readonly<Props>) {
  if (members.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={320}
        gap={2}
        sx={{
          borderRadius: 3,
          border: '1px dashed rgba(255,255,255,0.1)',
          background: alpha('#1C2128', 0.4),
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PeopleAlt sx={{ fontSize: 36, color: 'text.disabled' }} />
        </Box>
        <Box textAlign="center">
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
            No members yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Add your first family member to get started.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
      gap={2}
    >
      {members.map((member, i) => (
        <Box
          key={member.id}
          sx={{
            animation: `fadeInUp 0.4s ease ${i * 0.05}s both`,
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(16px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <MemberCard member={member} />
        </Box>
      ))}
    </Box>
  );
}