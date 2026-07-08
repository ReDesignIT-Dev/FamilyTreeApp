import { useEffect, useState } from 'react';
import type { CreatePersonDto, Gender, PersonDto, UpdatePersonDto } from '@/types/familyTree.types';
import { useAppDispatch } from '@/reduxComponents/hooks';
import { addTreeMember, updateTreeMember } from '@/reduxComponents/familyTree/familyTreeReducer';

export type AddMemberField = 'firstName' | 'lastName';
export type TextPersonKey = Exclude<keyof CreatePersonDto, 'gender'>;
type FormMode = 'add' | 'edit';

interface UseAddMemberFormParams {
    treeId: number;
    mode: FormMode;
    memberToEdit?: PersonDto | null;
    onSuccess: () => void;
}

const INITIAL_FORM: CreatePersonDto = {
    firstName: '',
    middleName: '',
    lastName: '',
    maidenName: '',
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    gender: undefined,
    biography: '',
};

function toDateInputValue(value?: string): string {
    return value ? value.slice(0, 10) : '';
}

function toFormFromMember(member?: PersonDto | null): CreatePersonDto {
    if (!member) {
        return INITIAL_FORM;
    }

    return {
        firstName: member.firstName ?? '',
        middleName: member.middleName ?? '',
        lastName: member.lastName ?? '',
        maidenName: member.maidenName ?? '',
        birthDate: toDateInputValue(member.birthDate),
        birthPlace: member.birthPlace ?? '',
        deathDate: toDateInputValue(member.deathDate),
        deathPlace: member.deathPlace ?? '',
        gender: member.gender,
        biography: member.biography ?? '',
    };
}
function toNullableString(value?: string): string | null {
    const trimmed = value?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : null;
}

function toNullableDate(value?: string): string | null {
    return value && value.length > 0 ? value : null;
}
export function useAddMemberForm({ treeId, mode, memberToEdit, onSuccess }: Readonly<UseAddMemberFormParams>) {
    const dispatch = useAppDispatch();

    const [form, setForm] = useState<CreatePersonDto>(toFormFromMember(memberToEdit));
    const [touched, setTouched] = useState<Record<AddMemberField, boolean>>({ firstName: false, lastName: false });
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setForm(toFormFromMember(memberToEdit));
        setTouched({ firstName: false, lastName: false });
        setSubmitAttempted(false);
        setError(null);
    }, [memberToEdit, mode]);

    const setTextField = (key: TextPersonKey, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
    const setGenderField = (value: Gender) => setForm((prev) => ({ ...prev, gender: value }));
    const handleBlur = (field: AddMemberField) => setTouched((prev) => ({ ...prev, [field]: true }));
    const showError = (field: AddMemberField, isEmpty: boolean): boolean => (touched[field] || submitAttempted) && isEmpty;

    const isValid = (form.firstName ?? '').trim().length > 0 || (form.lastName ?? '').trim().length > 0;

    const reset = () => {
        setForm(mode === 'edit' ? toFormFromMember(memberToEdit) : INITIAL_FORM);
        setTouched({ firstName: false, lastName: false });
        setSubmitAttempted(false);
        setError(null);
    };

    function buildPatchPayload(original: PersonDto, form: CreatePersonDto): Partial<UpdatePersonDto> {
        const payload: Partial<UpdatePersonDto> = {};

        if ((form.firstName ?? '') !== (original.firstName ?? '')) payload.firstName = toNullableString(form.firstName);
        if ((form.middleName ?? '') !== (original.middleName ?? '')) payload.middleName = toNullableString(form.middleName);
        if ((form.lastName ?? '') !== (original.lastName ?? '')) payload.lastName = toNullableString(form.lastName);
        if ((form.maidenName ?? '') !== (original.maidenName ?? '')) payload.maidenName = toNullableString(form.maidenName);
        if ((form.birthPlace ?? '') !== (original.birthPlace ?? '')) payload.birthPlace = toNullableString(form.birthPlace);
        if ((form.deathPlace ?? '') !== (original.deathPlace ?? '')) payload.deathPlace = toNullableString(form.deathPlace);
        if ((form.biography ?? '') !== (original.biography ?? '')) payload.biography = toNullableString(form.biography);

        if ((form.birthDate ?? '') !== ((original.birthDate ?? '').slice(0, 10))) payload.birthDate = toNullableDate(form.birthDate);
        if ((form.deathDate ?? '') !== ((original.deathDate ?? '').slice(0, 10))) payload.deathDate = toNullableDate(form.deathDate);

        if ((form.gender ?? '') !== (original.gender ?? '')) payload.gender = form.gender ?? null;

        return payload;
    }

    const handleSubmit = async () => {
        setSubmitAttempted(true);
        if (!isValid) return;

        setLoading(true);
        setError(null);

        try {
            const payload: UpdatePersonDto = {
                firstName: form.firstName?.trim() || undefined,
                lastName: form.lastName?.trim() || undefined,
                middleName: form.middleName?.trim() || undefined,
                maidenName: form.maidenName?.trim() || undefined,
                birthDate: form.birthDate || undefined,
                birthPlace: form.birthPlace?.trim() || undefined,
                deathDate: form.deathDate || undefined,
                deathPlace: form.deathPlace?.trim() || undefined,
                gender: form.gender || undefined,
                biography: form.biography?.trim() || undefined,
            };

            if (mode === 'edit') {
                if (!memberToEdit) {
                    setError('Member is not available for editing.');
                    return;
                }

                const patchPayload = buildPatchPayload(memberToEdit, form);
                await dispatch(updateTreeMember({ treeId, memberId: memberToEdit.id, data: patchPayload })).unwrap();

                // do not reset to old edit snapshot here
                onSuccess();
            } else {
                await dispatch(addTreeMember({ treeId, data: payload as CreatePersonDto })).unwrap();
                reset();
                onSuccess();
            }
        } catch (submitError: unknown) {
            if (submitError instanceof Error) {
                setError(submitError.message);
            } else if (typeof submitError === 'string') {
                setError(submitError);
            } else {
                setError(mode === 'edit' ? 'Failed to update member. Please try again.' : 'Failed to add member. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return { form, setTextField, setGenderField, handleBlur, showError, loading, error, handleSubmit, reset };
}