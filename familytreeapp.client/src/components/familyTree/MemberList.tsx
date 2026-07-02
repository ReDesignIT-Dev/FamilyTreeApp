import { Box, Typography } from '@mui/material';
import { PeopleAlt } from '@mui/icons-material';
import type { PersonSummaryDto } from '@/types/familyTree.types';
import MemberCard from './MemberCard';

interface Props {
  members: PersonSummaryDto[];
}

export default function MemberList({ members }: Readonly<Props>) {
  if (members.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={300} gap={2}>
        <PeopleAlt sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography color="text.secondary">
          No members yet. Add your first family member!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
      gap={2}
    >
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </Box>
  );
}