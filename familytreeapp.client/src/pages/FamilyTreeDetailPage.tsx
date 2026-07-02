import { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent,
  CircularProgress, Alert,
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import { FamilyTreeService } from '@/services/api/familyTreeService';
import { FamilyMembersService } from '@/services/api/familyMemberService';
import type { FamilyTree, PersonSummaryDto } from '@/types/familyTree.types';
import AddMemberDialog from '@/components/familyTree/AddMemberDialog';
import MemberList from '@/components/familyTree/MemberList';

export default function FamilyTreeDetailPage() {
  const [tree, setTree] = useState<FamilyTree | null>(null);
  const [members, setMembers] = useState<PersonSummaryDto[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const fetchMembers = useCallback(async (treeId: number) => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const data = await FamilyMembersService.getMembers(treeId);
      setMembers(data);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    FamilyTreeService.getMine()
      .then((data) => {
        setTree(data);
        void fetchMembers(data.id);
      })
      .catch((err) => setTreeError(err instanceof Error ? err.message : 'Failed to load family tree'))
      .finally(() => setTreeLoading(false));
  }, [fetchMembers]);

  const handleMemberAdded = useCallback(() => {
    if (tree) void fetchMembers(tree.id);
  }, [tree, fetchMembers]);

  if (treeLoading) {
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
        onMemberAdded={handleMemberAdded}
      />
    </Container>
  );
}