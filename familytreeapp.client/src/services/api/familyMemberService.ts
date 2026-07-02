import apiClient from '@/services/axiosConfig';
import { BACKEND_BASE_URL } from '@/config';
import type { CreatePersonDto, PersonDto } from '@/types/familyTree.types';

const membersUrl = (treeId: number) => `${BACKEND_BASE_URL}/api/trees/${treeId}/members`;

export class FamilyMembersService {
  static async addMember(treeId: number, data: CreatePersonDto): Promise<PersonDto> {
    const response = await apiClient.post<PersonDto>(membersUrl(treeId), data);
    return response.data;
  }

  static async getMembers(treeId: number): Promise<PersonDto[]> {
    const response = await apiClient.get<PersonDto[]>(membersUrl(treeId));
    return response.data;
  }
}