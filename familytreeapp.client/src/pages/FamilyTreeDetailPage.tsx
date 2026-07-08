import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent,
  CircularProgress, Alert,
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {tree.name}
        </Typography>
        <Button variant="outlined" startIcon={<Edit />}>
          Edit
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Family Members{members.length > 0 ? ` (${members.length})` : ''}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setAddMemberOpen(true)}>
              Add Member
            </Button>
          </Box>

          {membersError && <Alert severity="error" sx={{ mb: 2 }}>{membersError}</Alert>}

          {membersLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <MemberList members={members} />
          )}
        </CardContent>
      </Card>

      <AddMemberDialog
        open={addMemberOpen}
        treeId={tree.id}
        onClose={() => setAddMemberOpen(false)}
        onMemberAdded={() => undefined}
      />
    </Container>
  );
}