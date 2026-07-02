import { Avatar, Box, Card, CardActionArea, CardContent, Typography, Chip } from '@mui/material';
import type { PersonSummaryDto } from '@/types/familyTree.types';
import { useNavigate } from 'react-router-dom';
import { PATH_MEMBER_DETAIL } from '@/router/routes';

interface Props {
  member: PersonSummaryDto;
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function MemberCard({ member }: Readonly<Props>) {
  const navigate = useNavigate();
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  const birthDate = formatDate(member.birthDate);
  const deathDate = formatDate(member.deathDate);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea onClick={() => navigate(PATH_MEMBER_DETAIL(String(member.id)))} sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={member.profilePhotoUrl ?? undefined}
              sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
            >
              {initials}
            </Avatar>

            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {member.firstName} {member.lastName}
              </Typography>

              <Box display="flex" flexDirection="column" gap={0.5} mt={0.5}>
                {birthDate && (
                  <Typography variant="caption" color="text.secondary">
                    Born: {birthDate}
                  </Typography>
                )}
                {deathDate && (
                  <Typography variant="caption" color="text.secondary">
                    Died: {deathDate}
                  </Typography>
                )}
              </Box>

              {deathDate && (
                <Chip label="Deceased" size="small" variant="outlined" sx={{ mt: 1, fontSize: '0.65rem' }} />
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}