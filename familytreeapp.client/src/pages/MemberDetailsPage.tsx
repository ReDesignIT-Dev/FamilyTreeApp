import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PATH_MY_TREE } from '@/router/routes';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '@/reduxComponents/hooks';
import { deleteTreeMember, fetchMemberDetails, fetchMyFamilyTree } from '@/reduxComponents/familyTree/familyTreeReducer';
import AddMemberDialog from '@/components/familyTree/AddMemberDialog';

const EMPTY_PLACEHOLDER = '—';

export default function MemberDetailsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const currentTreeId = useAppSelector((state) => state.familyTree.currentTreeId);
  const loadingMemberDetails = useAppSelector((state) => state.familyTree.loadingMemberDetails);
  const deletingMember = useAppSelector((state) => state.familyTree.deletingMember);
  const updatingMember = useAppSelector((state) => state.familyTree.updatingMember);
  const memberError = useAppSelector((state) => state.familyTree.memberDetailsError);
  const loadingTree = useAppSelector((state) => state.familyTree.loadingTree);
  const treeError = useAppSelector((state) => state.familyTree.treeError);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const parsedMemberId = memberId ? Number.parseInt(memberId, 10) : Number.NaN;
  const isValidMemberId = Number.isInteger(parsedMemberId);

  const member = useAppSelector((state) => {
    if (!currentTreeId || !isValidMemberId) {
      return null;
    }

    return state.familyTree.memberDetailsByTreeId[currentTreeId]?.[parsedMemberId] ?? null;
  });

  useEffect(() => {
    void dispatch(fetchMyFamilyTree());
  }, [dispatch]);

  useEffect(() => {
    if (!currentTreeId || !isValidMemberId) {
      return;
    }

    void dispatch(fetchMemberDetails({ treeId: currentTreeId, memberId: parsedMemberId }));
  }, [dispatch, currentTreeId, isValidMemberId, parsedMemberId]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentTreeId || !isValidMemberId) {
      return;
    }

    setDeleteDialogOpen(false);

    const result = await dispatch(
      deleteTreeMember({ treeId: currentTreeId, memberId: parsedMemberId })
    );

    if (deleteTreeMember.fulfilled.match(result)) {
      navigate(PATH_MY_TREE);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const isBusy = loadingMemberDetails || deletingMember || updatingMember;

  const handleMemberUpdated = () => {
    if (!currentTreeId || !isValidMemberId) {
      return;
    }

    void dispatch(
      fetchMemberDetails({
        treeId: currentTreeId,
        memberId: parsedMemberId,
        force: true,
      })
    );
  };

  if ((loadingTree || loadingMemberDetails) && !member) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (treeError && !currentTreeId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(PATH_MY_TREE)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{treeError}</Alert>
      </Container>
    );
  }

  if (memberError && !member) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(PATH_MY_TREE)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">{memberError}</Alert>
      </Container>
    );
  }

  if (!member) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(PATH_MY_TREE)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="warning">Member not found</Alert>
      </Container>
    );
  }

  const fullName = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(' ') || EMPTY_PLACEHOLDER;

  const birthDateFormatted = member.birthDate
    ? new Date(member.birthDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : EMPTY_PLACEHOLDER;

  const deathDateFormatted = member.deathDate
    ? new Date(member.deathDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : EMPTY_PLACEHOLDER;

  const age = member.birthDate
    ? (() => {
        const birth = new Date(member.birthDate);
        const end = member.deathDate ? new Date(member.deathDate) : new Date();
        let calculatedAge = end.getFullYear() - birth.getFullYear();
        const monthDiff = end.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
          calculatedAge--;
        }
        return calculatedAge;
      })()
    : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Error Alert */}
      {memberError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {memberError}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(PATH_MY_TREE)}
          sx={{ mb: 2 }}
        >
          Back to Members
        </Button>
      </Box>

      {/* Member Basic Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Avatar */}
          <Grid size={{ xs: 12, sm: 'auto' }}>
            <Avatar
              src={member.profilePhotoUrl}
              alt={fullName}
              sx={{ width: 150, height: 150, fontSize: '3rem' }}
            >
              {fullName === EMPTY_PLACEHOLDER ? '?' : fullName.charAt(0)}
            </Avatar>
          </Grid>

          {/* Header Info & Actions */}
          <Grid size={{ xs: 12, sm: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                  {fullName}
                </Typography>
                {member.middleName && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Middle Name: {member.middleName}
                  </Typography>
                )}
                {member.maidenName && (
                  <Typography variant="body2" color="textSecondary">
                    Maiden Name: {member.maidenName}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  disabled={isBusy}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                  disabled={isBusy}
                >
                  Delete
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Demographics */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  Gender
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {member.gender || EMPTY_PLACEHOLDER}
                </Typography>
              </Grid>
              {age !== null && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Age
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {age} years
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Life Events Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Life Events
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {/* Birth */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                Birth Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                {birthDateFormatted}
              </Typography>
              {member.birthPlace && (
                <>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Birth Place
                  </Typography>
                  <Typography variant="body2">{member.birthPlace}</Typography>
                </>
              )}
            </Box>
          </Grid>

          {/* Death */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                Death Date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                {deathDateFormatted}
              </Typography>
              {member.deathPlace && (
                <>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    Death Place
                  </Typography>
                  <Typography variant="body2">{member.deathPlace}</Typography>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Biography Card */}
      {member.biography && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Biography
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {member.biography}
          </Typography>
        </Paper>
      )}

      {/* Metadata Card */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Member ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {member.id}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Created
            </Typography>
            <Typography variant="body2">
              {new Date(member.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{fullName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isBusy}
          >
            {isBusy ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog */}
      <AddMemberDialog
        open={editDialogOpen}
        treeId={currentTreeId ?? 0}
        memberToEdit={member}
        onClose={() => setEditDialogOpen(false)}
        onMemberAdded={handleMemberUpdated}
      />
    </Container>
  );
}