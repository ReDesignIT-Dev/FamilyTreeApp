import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import type { Gender } from '@/types/familyTree.types';

interface Props {
  value?: Gender;
  onChange: (value: Gender) => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export default function PersonGenderField({ value, onChange }: Props) {
  return (
    <FormControl>
      <FormLabel>Gender</FormLabel>
      <RadioGroup row value={value ?? ''} onChange={(e) => onChange(e.target.value as Gender)}>
        {GENDER_OPTIONS.map((opt) => (
          <FormControlLabel key={opt.value} value={opt.value} control={<Radio size="small" />} label={opt.label} />
        ))}
      </RadioGroup>
    </FormControl>
  );
}