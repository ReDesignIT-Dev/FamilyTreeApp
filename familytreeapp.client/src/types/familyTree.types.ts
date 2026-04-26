export interface FamilyTree {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  ownerUsername: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  memberCount: number;
}

export interface CreateFamilyTreeDto {
  name: string;
  description?: string;
}

export interface UpdateFamilyTreeDto {
  name?: string;
  description?: string;
}