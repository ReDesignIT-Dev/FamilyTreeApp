import { useState } from 'react';
import type { CreatePersonDto, Gender } from '@/types/familyTree.types';
import { FamilyMembersService } from '@/services/api/familyMemberService';

export type AddMemberField = 'firstName' | 'lastName';
export type TextPersonKey = Exclude<keyof CreatePersonDto, 'gender'>;

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

export function useAddMemberForm(treeId: number, onSuccess: () => void) {
    const [form, setForm] = useState<CreatePersonDto>(INITIAL_FORM);
    const [touched, setTouched] = useState<Record<AddMemberField, boolean>>({
        firstName: false,
        lastName: false,
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setTextField = (key: TextPersonKey, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const setGenderField = (value: Gender) =>
        setForm((prev) => ({ ...prev, gender: value }));

    const handleBlur = (field: AddMemberField) =>
        setTouched((prev) => ({ ...prev, [field]: true }));

    const showError = (field: AddMemberField, isEmpty: boolean): boolean =>
        (touched[field] || submitAttempted) && isEmpty;

    const isValid =
        (form.firstName ?? '').trim().length > 0 ||
        (form.lastName ?? '').trim().length > 0;

    const reset = () => {
        setForm(INITIAL_FORM);
        setTouched({ firstName: false, lastName: false });
        setSubmitAttempted(false);
        setError(null);
    };

    const handleSubmit = async () => {
        setSubmitAttempted(true);
        if (!isValid) return;

        setLoading(true);
        setError(null);

        try {
            const payload: CreatePersonDto = {
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

            await FamilyMembersService.addMember(treeId, payload);
            reset();
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add member. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { form, setTextField, setGenderField, handleBlur, showError, loading, error, handleSubmit, reset, isValid };
}