import { ApiClient } from '@/services/api/apiClient';
import type { FamilyTree, CreateFamilyTreeDto, UpdateFamilyTreeDto } from '@/types/familyTree.types';

export class FamilyTreeService {
  private static readonly BASE_PATH = '/familytrees';

  static async getAll(): Promise<FamilyTree[]> {
    return ApiClient.get<FamilyTree[]>(this.BASE_PATH);
  }

  static async getById(id: string): Promise<FamilyTree> {
    return ApiClient.get<FamilyTree>(`${this.BASE_PATH}/${id}`);
  }

  static async create(data: CreateFamilyTreeDto): Promise<FamilyTree> {
    return ApiClient.post<FamilyTree>(this.BASE_PATH, data);
  }

  static async update(id: string, data: UpdateFamilyTreeDto): Promise<FamilyTree> {
    return ApiClient.put<FamilyTree>(`${this.BASE_PATH}/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`${this.BASE_PATH}/${id}`);
  }
}