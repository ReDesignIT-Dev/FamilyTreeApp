export interface FamilyTree {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  memberCount: number;
}

export interface UpdateFamilyTreeDto {
  name: string;
  description?: string;
}

export type Gender = 'Male' | 'Female';

export interface CreatePersonDto {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  maidenName?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  gender?: Gender;
  biography?: string;
}

export interface UpdatePersonDto {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    maidenName?: string | null;
    birthDate?: string | null;
    birthPlace?: string | null;
    deathDate?: string | null;
    deathPlace?: string | null;
    gender?: Gender | null;
    biography?: string | null;
}

export interface PersonDto {
  id: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  maidenName?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  gender?: Gender;
  biography?: string;
  profilePhotoUrl?: string;
  createdAt: string;
}

export interface PersonSummaryDto {
  id: number;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
  profilePhotoUrl?: string;
}