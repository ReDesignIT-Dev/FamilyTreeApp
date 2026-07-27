import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Typography, alpha,
} from '@mui/material';
import type { Gender, PersonDto } from '@/types/familyTree.types';
import { useAddMemberForm } from '@/hooks/useAddMemberForm';
import PersonBiographyField from './fields/PersonBiographyField';
import PersonGenderField from './fields/PersonGenderField';
import PersonLifeEventFields from './fields/PersonLifeEventFields';
import PersonNameFields from './fields/PersonNameFields';

interface Props {
  open: boolean;
  treeId: number;
  onClose: () => void;
  onMemberAdded: () => void;
  memberToEdit?: PersonDto | null;
}

export default function AddMemberDialog({
  open,
  treeId,
  onClose,
  onMemberAdded,
  memberToEdit,
}: Readonly<Props>) {
  const mode = memberToEdit ? 'edit' : 'add';

  const { form, setTextField, setGenderField, handleBlur, showError, loading, error, handleSubmit, reset } =
    useAddMemberForm({
      treeId,
      mode,
      memberToEdit,
      onSuccess: () => {
        onMemberAdded();
        onClose();
      },
    });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          {mode === 'edit' ? 'Edit Family Member' : 'Add Family Member'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {mode === 'edit' ? 'Update member information' : 'Fill in the details for the new member'}
        </Typography>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 3, height: 16, borderRadius: 2, bgcolor: '#4CAF7D' }} />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">NAME</Typography>
            </Box>
            <PersonNameFields
              firstName={form.firstName ?? ''}
              middleName={form.middleName ?? ''}
              lastName={form.lastName ?? ''}
              maidenName={form.maidenName ?? ''}
              onChange={setTextField}
              onBlur={handleBlur}
              showError={showError}
            />
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 3, height: 16, borderRadius: 2, bgcolor: '#F5A623' }} />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">GENDER</Typography>
            </Box>
            <PersonGenderField
              value={form.gender ?? 'Male'}
              onChange={(value: Gender) => setGenderField(value)}
            />
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 3, height: 16, borderRadius: 2, bgcolor: '#4CAF7D' }} />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">LIFE EVENTS</Typography>
            </Box>
            <PersonLifeEventFields
              birthDate={form.birthDate ?? ''}
              birthPlace={form.birthPlace ?? ''}
              deathDate={form.deathDate ?? ''}
              deathPlace={form.deathPlace ?? ''}
              onChange={setTextField}
            />
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 3, height: 16, borderRadius: 2, bgcolor: '#F5A623' }} />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">BIOGRAPHY</Typography>
            </Box>
            <PersonBiographyField
              value={form.biography ?? ''}
              onChange={(value) => setTextField('biography', value)}
            />
          </Box>
        </Box>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ minWidth: 120 }}
        >
          {mode === 'edit' ? 'Save Changes' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}