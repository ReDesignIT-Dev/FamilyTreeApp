import apiClient from '@/services/axiosConfig';
import { BACKEND_BASE_URL } from '@/config';
import type { FamilyTree, UpdateFamilyTreeDto } from '@/types/familyTree.types';

const BASE_URL = `${BACKEND_BASE_URL}/api/familytrees`;

export class FamilyTreeService {
  // GET /api/familytrees/my
  static async getMine(): Promise<FamilyTree> {
    const response = await apiClient.get<FamilyTree>(`${BASE_URL}/my`);
    return response.data;
  }

  // PUT /api/familytrees/my
  static async updateMine(data: UpdateFamilyTreeDto): Promise<FamilyTree> {
    const response = await apiClient.put<FamilyTree>(`${BASE_URL}/my`, data);
    return response.data;
  }
}