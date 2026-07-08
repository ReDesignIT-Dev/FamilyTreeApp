import apiClient from '@/services/axiosConfig';
import { BACKEND_BASE_URL } from '@/config';
import type { CreatePersonDto, PersonDto, PersonSummaryDto, UpdatePersonDto } from '@/types/familyTree.types';

export class FamilyMembersService {
  static async addMember(treeId: number, data: CreatePersonDto): Promise<PersonDto> {
    const response = await apiClient.post<PersonDto>(
      `${BACKEND_BASE_URL}/api/trees/${treeId}/members`,
      data
    );
    return response.data;
  }

  static async getMembers(treeId: number): Promise<PersonSummaryDto[]> {
    const response = await apiClient.get<PersonSummaryDto[]>(
      `${BACKEND_BASE_URL}/api/trees/${treeId}/members`
    );
    return response.data;
  }

  static async getMemberById(treeId: number, memberId: number): Promise<PersonDto> {
    const response = await apiClient.get<PersonDto>(
      `${BACKEND_BASE_URL}/api/trees/${treeId}/members/${memberId}`
    );
    return response.data;
  }

  static async updateMember(
    treeId: number,
    memberId: number,
    data: UpdatePersonDto
  ): Promise<PersonDto> {
    const response = await apiClient.patch<PersonDto>(
      `${BACKEND_BASE_URL}/api/trees/${treeId}/members/${memberId}`,
      data
    );
    return response.data;
  }

  static async deleteMember(treeId: number, memberId: number): Promise<void> {
    await apiClient.delete(
      `${BACKEND_BASE_URL}/api/trees/${treeId}/members/${memberId}`
    );
  }
}