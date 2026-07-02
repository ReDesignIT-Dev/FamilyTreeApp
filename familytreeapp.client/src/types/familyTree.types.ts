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

export type Gender = 'Male' | 'Female' | 'Other';

export interface CreatePersonDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  gender?: Gender;
  biography?: string;
}

export interface PersonDto {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
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