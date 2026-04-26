import apiClient from '@/services/axiosConfig';
import { BACKEND_BASE_URL } from '@/config';
import type { FamilyTree, CreateFamilyTreeDto, UpdateFamilyTreeDto } from '@/types/familyTree.types';

const BASE_URL = `${BACKEND_BASE_URL}/api/familytrees`;

export class FamilyTreeService {
  // GET /api/familytrees
  static async getAll(): Promise<FamilyTree[]> {
    const response = await apiClient.get<FamilyTree[]>(BASE_URL);
    return response.data;
  }

  // GET /api/familytrees/{id}
  static async getById(id: string): Promise<FamilyTree> {
    const response = await apiClient.get<FamilyTree>(`${BASE_URL}/${id}`);
    return response.data;
  }

  // POST /api/familytrees
  static async create(data: CreateFamilyTreeDto): Promise<FamilyTree> {
    const response = await apiClient.post<FamilyTree>(BASE_URL, data);
    return response.data;
  }

  // PUT /api/familytrees/{id}
  static async update(id: string, data: UpdateFamilyTreeDto): Promise<FamilyTree> {
    const response = await apiClient.put<FamilyTree>(`${BASE_URL}/${id}`, data);
    return response.data;
  }

  // DELETE /api/familytrees/{id}
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }

  // POST /api/familytrees/{id}/share
  static async share(id: string, data: { userId: number }): Promise<void> {
    await apiClient.post(`${BASE_URL}/${id}/share`, data);
  }

  // GET /api/familytrees/{id}/collaborators
  static async getCollaborators(id: string): Promise<unknown[]> {
    const response = await apiClient.get<unknown[]>(`${BASE_URL}/${id}/collaborators`);
    return response.data;
  }

  // DELETE /api/familytrees/{id}/collaborators/{collaboratorId}
  static async removeCollaborator(id: string, collaboratorId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}/collaborators/${collaboratorId}`);
  }
}