import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button,
  CircularProgress, Alert, alpha, Chip,
} from '@mui/material';
import { Add, AccountTree, People } from '@mui/icons-material';
import AddMemberDialog from '@/components/familyTree/AddMemberDialog';
import MemberList from '@/components/familyTree/MemberList';
import { useAppDispatch, useAppSelector } from '@/reduxComponents/hooks';
import {
  fetchMyFamilyTree,
  fetchTreeMembers,
  selectCurrentTree,
  selectCurrentTreeId,
  selectCurrentTreeMembers,
} from '@/reduxComponents/familyTree/familyTreeReducer';

export default function FamilyTreeDetailPage() {
  const dispatch = useAppDispatch();
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const tree = useAppSelector(selectCurrentTree);
  const treeId = useAppSelector(selectCurrentTreeId);
  const members = useAppSelector(selectCurrentTreeMembers);
  const treeLoading = useAppSelector((state) => state.familyTree.loadingTree);
  const membersLoading = useAppSelector((state) => state.familyTree.loadingMembers);
  const treeError = useAppSelector((state) => state.familyTree.treeError);
  const membersError = useAppSelector((state) => state.familyTree.membersError);

  useEffect(() => {
    void dispatch(fetchMyFamilyTree());
  }, [dispatch]);

  useEffect(() => {
    if (treeId) {
      void dispatch(fetchTreeMembers({ treeId }));
    }
  }, [dispatch, treeId]);

  if (treeLoading && !tree) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading your family tree...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (treeError || !tree) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{treeError || 'Tree not found'}</Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero banner */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 5, md: 6 },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 100% at 0% 50%, rgba(76,175,125,0.15) 0%, transparent 60%),
              radial-gradient(ellipse 50% 80% at 100% 0%, rgba(245,166,35,0.07) 0%, transparent 60%)
            `,
            pointerEvents: 'none',
          },
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                  boxShadow: '0 4px 20px rgba(76,175,125,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountTree sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight={700}
                  sx={{
                    background: 'linear-gradient(135deg, #E6EDF3 0%, #81C99B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  {tree.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<People sx={{ fontSize: '0.875rem !important' }} />}
                    label={`${members.length} member${members.length !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: alpha('#4CAF7D', 0.12),
                      color: '#4CAF7D',
                      border: `1px solid ${alpha('#4CAF7D', 0.25)}`,
                      fontWeight: 500,
                      '& .MuiChip-icon': { color: '#4CAF7D' },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddMemberOpen(true)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Add Member
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Members Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        {membersError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {membersError}
          </Alert>
        )}

        {membersLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <MemberList members={members} />
        )}
      </Container>

      <AddMemberDialog
        open={addMemberOpen}
        treeId={tree.id}
        onClose={() => setAddMemberOpen(false)}
        onMemberAdded={() => undefined}
      />
    </Box>
  );
}