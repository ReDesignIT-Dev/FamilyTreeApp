import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Typography,
} from '@mui/material';
import type { Gender } from '@/types/familyTree.types';
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
}

export default function AddMemberDialog({ open, treeId, onClose, onMemberAdded }: Readonly<Props>) {
  const { form, setTextField, setGenderField, handleBlur, showError, loading, error, handleSubmit, reset } =
    useAddMemberForm(treeId, () => {
      onMemberAdded();
      onClose();
    });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Family Member</DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Name</Typography>
            <PersonNameFields
              firstName={form.firstName}
              middleName={form.middleName}
              lastName={form.lastName}
              maidenName={form.maidenName}
              onChange={setTextField}
              onBlur={handleBlur}
              showError={showError}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Gender</Typography>
            <PersonGenderField
              value={form.gender}
              onChange={(value: Gender) => setGenderField(value)}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Life Events</Typography>
            <PersonLifeEventFields
              birthDate={form.birthDate}
              birthPlace={form.birthPlace}
              deathDate={form.deathDate}
              deathPlace={form.deathPlace}
              onChange={setTextField}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Biography</Typography>
            <PersonBiographyField
              value={form.biography ?? ''}
              onChange={(value) => setTextField('biography', value)}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Add Member
        </Button>
      </DialogActions>
    </Dialog>
  );
}