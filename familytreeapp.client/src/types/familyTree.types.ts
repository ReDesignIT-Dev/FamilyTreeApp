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