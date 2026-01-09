export interface FamilyTree {
  id: number;
  name: string;
  description?: string;
  createdDate: string;
  userId: string;
}
    
export interface CreateFamilyTreeDto {
  name: string;
  description?: string;
}

export interface UpdateFamilyTreeDto {
  name?: string;
  description?: string;
}