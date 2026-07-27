import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  alpha,
  Divider,
} from '@mui/material';
import { PATH_MY_TREE } from '@/router/routes';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CakeIcon from '@mui/icons-material/Cake';
import PlaceIcon from '@mui/icons-material/Place';
import { useAppDispatch, useAppSelector } from '@/reduxComponents/hooks';
import { deleteTreeMember, fetchMemberDetails, fetchMyFamilyTree } from '@/reduxComponents/familyTree/familyTreeReducer';
import AddMemberDialog from '@/components/familyTree/AddMemberDialog';

const EMPTY_PLACEHOLDER = '—';

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: value === EMPTY_PLACEHOLDER ? 'text.disabled' : 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(28,33,40,0.6)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        mb: 3,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}

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
    if (!currentTreeId || !isValidMemberId) return null;
    return state.familyTree.memberDetailsByTreeId[currentTreeId]?.[parsedMemberId] ?? null;
  });

  useEffect(() => { void dispatch(fetchMyFamilyTree()); }, [dispatch]);

  useEffect(() => {
    if (!currentTreeId || !isValidMemberId) return;
    void dispatch(fetchMemberDetails({ treeId: currentTreeId, memberId: parsedMemberId }));
  }, [dispatch, currentTreeId, isValidMemberId, parsedMemberId]);

  const handleDeleteConfirm = async () => {
    if (!currentTreeId || !isValidMemberId) return;
    setDeleteDialogOpen(false);
    const result = await dispatch(deleteTreeMember({ treeId: currentTreeId, memberId: parsedMemberId }));
    if (deleteTreeMember.fulfilled.match(result)) navigate(PATH_MY_TREE);
  };

  const handleMemberUpdated = () => {
    if (!currentTreeId || !isValidMemberId) return;
    void dispatch(fetchMemberDetails({ treeId: currentTreeId, memberId: parsedMemberId, force: true }));
  };

  const isBusy = loadingMemberDetails || deletingMember || updatingMember;

  if ((loadingTree || loadingMemberDetails) && !member) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if ((treeError && !currentTreeId) || (memberError && !member)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(PATH_MY_TREE)} sx={{ mb: 2 }}>
          Back to Tree
        </Button>
        <Alert severity="error">{treeError || memberError}</Alert>
      </Container>
    );
  }

  if (!member) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(PATH_MY_TREE)} sx={{ mb: 2 }}>
          Back to Tree
        </Button>
        <Alert severity="warning">Member not found</Alert>
      </Container>
    );
  }

  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ') || EMPTY_PLACEHOLDER;
  const initials = `${(member.firstName?.[0] ?? '')}${(member.lastName?.[0] ?? '')}`.toUpperCase() || '?';

  const birthDateFormatted = member.birthDate
    ? new Date(member.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : EMPTY_PLACEHOLDER;

  const deathDateFormatted = member.deathDate
    ? new Date(member.deathDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : EMPTY_PLACEHOLDER;

  const age = member.birthDate
    ? (() => {
        const birth = new Date(member.birthDate);
        const end = member.deathDate ? new Date(member.deathDate) : new Date();
        let a = end.getFullYear() - birth.getFullYear();
        const m = end.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) a--;
        return a;
      })()
    : null;

  return (
    <Box>
      {/* Hero section with gradient background */}
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
              radial-gradient(ellipse 80% 100% at 0% 50%, rgba(76,175,125,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 80% at 100% 0%, rgba(245,166,35,0.06) 0%, transparent 60%)
            `,
          },
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {memberError && <Alert severity="error" sx={{ mb: 3 }}>{memberError}</Alert>}

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(PATH_MY_TREE)}
            sx={{ mb: 3, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            Back to Tree
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <Avatar
              src={member.profilePhotoUrl}
              alt={fullName}
              sx={{
                width: { xs: 90, md: 110 },
                height: { xs: 90, md: 110 },
                fontSize: '2.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
                boxShadow: '0 8px 32px rgba(76,175,125,0.35)',
                border: '3px solid rgba(76,175,125,0.3)',
              }}
            >
              {initials}
            </Avatar>

            {/* Name & actions */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
                <Box>
                  <Typography
                    variant="h4"
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
                    {fullName}
                  </Typography>
                  {member.middleName && (
                    <Typography variant="body2" color="text.secondary">
                      Middle: {member.middleName}
                    </Typography>
                  )}
                  {member.maidenName && (
                    <Typography variant="body2" color="text.secondary">
                      Maiden: {member.maidenName}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditDialogOpen(true)} disabled={isBusy} size="small">
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)} disabled={isBusy} size="small">
                    Delete
                  </Button>
                </Stack>
              </Box>

              {/* Quick stats */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {member.gender && (
                  <Chip label={member.gender} size="small" sx={{ bgcolor: alpha('#4CAF7D', 0.1), color: '#4CAF7D', border: `1px solid ${alpha('#4CAF7D', 0.25)}`, fontWeight: 500 }} />
                )}
                {member.deathDate && (
                  <Chip label="Deceased" size="small" sx={{ bgcolor: alpha('#8B949E', 0.12), color: '#8B949E', border: '1px solid rgba(139,148,158,0.25)', fontWeight: 500 }} />
                )}
                {age !== null && (
                  <Chip label={`${age} years`} size="small" sx={{ bgcolor: alpha('#F5A623', 0.1), color: '#F5A623', border: `1px solid ${alpha('#F5A623', 0.25)}`, fontWeight: 500 }} />
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Details */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Life Events */}
            <SectionCard title="Life Events">
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CakeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight={600} color="primary.main">Birth</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>{birthDateFormatted}</Typography>
                  {member.birthPlace && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <PlaceIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">{member.birthPlace}</Typography>
                    </Box>
                  )}
                </Box>
                {member.deathDate && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">Death</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>{deathDateFormatted}</Typography>
                    {member.deathPlace && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <PlaceIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">{member.deathPlace}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </SectionCard>

            {/* Meta */}
            <SectionCard title="Record Info">
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <InfoField label="Member ID" value={String(member.id)} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <InfoField
                    label="Added"
                    value={new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  />
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>

          {/* Biography */}
          {member.biography && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Biography">
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                  {member.biography}
                </Typography>
              </SectionCard>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha('#F85149', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteIcon sx={{ fontSize: 20, color: 'error.main' }} />
            </Box>
            Delete Member
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography>
            Are you sure you want to delete <strong>{fullName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isBusy}>
            {isBusy ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <AddMemberDialog
        open={editDialogOpen}
        treeId={currentTreeId ?? 0}
        memberToEdit={member}
        onClose={() => setEditDialogOpen(false)}
        onMemberAdded={handleMemberUpdated}
      />
    </Box>
  );
}