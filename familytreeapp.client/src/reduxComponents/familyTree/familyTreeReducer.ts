import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/reduxComponents/store';
import { FamilyTreeService } from '@/services/api/familyTreeService';
import { FamilyMembersService } from '@/services/api/familyMemberService';
import { apiErrorHandler } from '@/services/apiErrorHandler';
import type { CreatePersonDto, FamilyTree, PersonDto, PersonSummaryDto, UpdatePersonDto } from '@/types/familyTree.types';

interface FamilyTreeState {
  currentTree: FamilyTree | null;
  currentTreeId: number | null;
  membersByTreeId: Record<number, PersonSummaryDto[]>;
  memberDetailsByTreeId: Record<number, Record<number, PersonDto>>;
  loadedMembersByTreeId: Record<number, boolean>;
  loadingTree: boolean;
  loadingMembers: boolean;
  loadingMemberDetails: boolean;
  addingMember: boolean;
  deletingMember: boolean;
  updatingMember: boolean;
  treeError: string | null;
  membersError: string | null;
  memberDetailsError: string | null;
}

interface RejectConfig {
  state: RootState;
  rejectValue: string;
}

interface FetchMembersArgs {
  treeId?: number;
  force?: boolean;
}

interface FetchMemberDetailsArgs {
  treeId?: number;
  memberId: number;
  force?: boolean;
}

interface AddTreeMemberArgs {
  treeId: number;
  data: CreatePersonDto;
}

interface DeleteTreeMemberArgs {
  treeId: number;
  memberId: number;
}

interface UpdateTreeMemberArgs {
  treeId: number;
  memberId: number;
  data: UpdatePersonDto;
}

function toErrorMessage(error: unknown, fallback: string): string {
  try {
    apiErrorHandler(error);
    return fallback;
  } catch (handledError: unknown) {
    if (handledError instanceof Error) {
      return handledError.message;
    }
    if (typeof handledError === 'string') {
      return handledError;
    }
    return fallback;
  }
}

function toSummary(member: PersonDto): PersonSummaryDto {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    birthDate: member.birthDate,
    deathDate: member.deathDate,
    profilePhotoUrl: member.profilePhotoUrl,
  };
}

const initialState: FamilyTreeState = {
  currentTree: null,
  currentTreeId: null,
  membersByTreeId: {},
  memberDetailsByTreeId: {},
  loadedMembersByTreeId: {},
  loadingTree: false,
  loadingMembers: false,
  loadingMemberDetails: false,
  addingMember: false,
  deletingMember: false,
  updatingMember: false,
  treeError: null,
  membersError: null,
  memberDetailsError: null,
};

export const fetchMyFamilyTree = createAsyncThunk<FamilyTree, { force?: boolean } | undefined, RejectConfig>(
  'familyTree/fetchMyFamilyTree',
  async (_, { rejectWithValue }) => {
    try {
      return await FamilyTreeService.getMine();
    } catch (error: unknown) {
      return rejectWithValue(toErrorMessage(error, 'Failed to load family tree'));
    }
  },
  {
    condition: (args, { getState }) => {
      if (args?.force) {
        return true;
      }
      return getState().familyTree.currentTree === null;
    },
  }
);

export const fetchTreeMembers = createAsyncThunk<
  { treeId: number; members: PersonSummaryDto[] },
  FetchMembersArgs | undefined,
  RejectConfig
>(
  'familyTree/fetchTreeMembers',
  async (args, { getState, rejectWithValue }) => {
    const state = getState();
    const treeId = args?.treeId ?? state.familyTree.currentTreeId;

    if (!treeId) {
      return rejectWithValue('Family tree is not selected');
    }

    try {
      const members = await FamilyMembersService.getMembers(treeId);
      return { treeId, members };
    } catch (error: unknown) {
      return rejectWithValue(toErrorMessage(error, 'Failed to load members'));
    }
  },
  {
    condition: (args, { getState }) => {
      if (args?.force) {
        return true;
      }

      const state = getState();
      const treeId = args?.treeId ?? state.familyTree.currentTreeId;
      if (!treeId) {
        return false;
      }

      return state.familyTree.loadedMembersByTreeId[treeId] !== true;
    },
  }
);

export const fetchMemberDetails = createAsyncThunk<
  { treeId: number; member: PersonDto },
  FetchMemberDetailsArgs,
  RejectConfig
>(
  'familyTree/fetchMemberDetails',
  async ({ treeId, memberId }, { getState, rejectWithValue }) => {
    const state = getState();
    const resolvedTreeId = treeId ?? state.familyTree.currentTreeId;

    if (!resolvedTreeId) {
      return rejectWithValue('Family tree is not selected');
    }

    try {
      const member = await FamilyMembersService.getMemberById(resolvedTreeId, memberId);
      return { treeId: resolvedTreeId, member };
    } catch (error: unknown) {
      return rejectWithValue(toErrorMessage(error, 'Failed to load member details'));
    }
  },
  {
    condition: (args, { getState }) => {
      if (args.force) {
        return true;
      }

      const state = getState();
      const treeId = args.treeId ?? state.familyTree.currentTreeId;
      if (!treeId) {
        return false;
      }

      return !state.familyTree.memberDetailsByTreeId[treeId]?.[args.memberId];
    },
  }
);

export const addTreeMember = createAsyncThunk<{ treeId: number; member: PersonDto }, AddTreeMemberArgs, RejectConfig>(
  'familyTree/addTreeMember',
  async ({ treeId, data }, { rejectWithValue }) => {
    try {
      const member = await FamilyMembersService.addMember(treeId, data);
      return { treeId, member };
    } catch (error: unknown) {
      return rejectWithValue(toErrorMessage(error, 'Failed to add member'));
    }
  }
);

export const deleteTreeMember = createAsyncThunk<DeleteTreeMemberArgs, DeleteTreeMemberArgs, RejectConfig>(
  'familyTree/deleteTreeMember',
  async ({ treeId, memberId }, { rejectWithValue }) => {
    try {
      await FamilyMembersService.deleteMember(treeId, memberId);
      return { treeId, memberId };
    } catch (error: unknown) {
      return rejectWithValue(toErrorMessage(error, 'Failed to delete member'));
    }
  }
);

export const updateTreeMember = createAsyncThunk<
  { treeId: number; member: PersonDto },
  UpdateTreeMemberArgs,
  RejectConfig
>(
  'familyTree/updateTreeMember',
  async ({ treeId, memberId, data }, { rejectWithValue }) => {
    try {
      const member = await FamilyMembersService.updateMember(treeId, memberId, data);
      return { treeId, member };
    } catch (error: unknown) {
      return rejectWithValue(toErrorMessage(error, 'Failed to update member'));
    }
  }
);

const familyTreeSlice = createSlice({
  name: 'familyTree',
  initialState,
  reducers: {
    clearFamilyTreeCache(state) {
      state.currentTree = null;
      state.currentTreeId = null;
      state.membersByTreeId = {};
      state.memberDetailsByTreeId = {};
      state.loadedMembersByTreeId = {};
      state.treeError = null;
      state.membersError = null;
      state.memberDetailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyFamilyTree.pending, (state) => {
        state.loadingTree = true;
        state.treeError = null;
      })
      .addCase(fetchMyFamilyTree.fulfilled, (state, action) => {
        state.loadingTree = false;
        state.currentTree = action.payload;
        state.currentTreeId = action.payload.id;
      })
      .addCase(fetchMyFamilyTree.rejected, (state, action) => {
        state.loadingTree = false;
        state.treeError = action.payload ?? 'Failed to load family tree';
      })

      .addCase(fetchTreeMembers.pending, (state) => {
        state.loadingMembers = true;
        state.membersError = null;
      })
      .addCase(fetchTreeMembers.fulfilled, (state, action) => {
        state.loadingMembers = false;
        state.membersByTreeId[action.payload.treeId] = action.payload.members;
        state.loadedMembersByTreeId[action.payload.treeId] = true;
      })
      .addCase(fetchTreeMembers.rejected, (state, action) => {
        state.loadingMembers = false;
        state.membersError = action.payload ?? 'Failed to load members';
      })

      .addCase(fetchMemberDetails.pending, (state) => {
        state.loadingMemberDetails = true;
        state.memberDetailsError = null;
      })
      .addCase(fetchMemberDetails.fulfilled, (state, action) => {
        state.loadingMemberDetails = false;
        const { treeId, member } = action.payload;
        state.memberDetailsByTreeId[treeId] ??= {};
        state.memberDetailsByTreeId[treeId][member.id] = member;
      })
      .addCase(fetchMemberDetails.rejected, (state, action) => {
        state.loadingMemberDetails = false;
        state.memberDetailsError = action.payload ?? 'Failed to load member details';
      })

      .addCase(addTreeMember.pending, (state) => {
        state.addingMember = true;
        state.membersError = null;
      })
      .addCase(addTreeMember.fulfilled, (state, action) => {
        state.addingMember = false;
        const { treeId, member } = action.payload;
        const summary = toSummary(member);

        state.memberDetailsByTreeId[treeId] ??= {};
        state.memberDetailsByTreeId[treeId][member.id] = member;

        state.membersByTreeId[treeId] ??= [];
        state.membersByTreeId[treeId] = [summary, ...state.membersByTreeId[treeId].filter((m) => m.id !== member.id)];
        state.loadedMembersByTreeId[treeId] = true;
      })
      .addCase(addTreeMember.rejected, (state, action) => {
        state.addingMember = false;
        state.membersError = action.payload ?? 'Failed to add member';
      })

      .addCase(deleteTreeMember.pending, (state) => {
        state.deletingMember = true;
        state.memberDetailsError = null;
      })
      .addCase(deleteTreeMember.fulfilled, (state, action) => {
        state.deletingMember = false;
        const { treeId, memberId } = action.payload;

        state.membersByTreeId[treeId] = (state.membersByTreeId[treeId] ?? []).filter((m) => m.id !== memberId);

        if (state.memberDetailsByTreeId[treeId]) {
          delete state.memberDetailsByTreeId[treeId][memberId];
        }
      })
      .addCase(deleteTreeMember.rejected, (state, action) => {
        state.deletingMember = false;
        state.memberDetailsError = action.payload ?? 'Failed to delete member';
      })

      .addCase(updateTreeMember.pending, (state) => {
        state.updatingMember = true;
        state.memberDetailsError = null;
      })
      .addCase(updateTreeMember.fulfilled, (state, action) => {
        state.updatingMember = false;
        const { treeId, member } = action.payload;
        const summary = toSummary(member);

        state.memberDetailsByTreeId[treeId] ??= {};
        state.memberDetailsByTreeId[treeId][member.id] = member;

        state.membersByTreeId[treeId] ??= [];
        state.membersByTreeId[treeId] = state.membersByTreeId[treeId].map((m) =>
          m.id === member.id ? summary : m
        );
      })
      .addCase(updateTreeMember.rejected, (state, action) => {
        state.updatingMember = false;
        state.memberDetailsError = action.payload ?? 'Failed to update member';
      });
  },
});

export const { clearFamilyTreeCache } = familyTreeSlice.actions;

// Keep one stable reference for empty arrays
const EMPTY_MEMBERS: readonly PersonSummaryDto[] = [];
export const selectCurrentTree = (state: RootState): FamilyTree | null => state.familyTree.currentTree;
export const selectCurrentTreeId = (state: RootState): number | null => state.familyTree.currentTreeId;
const selectMembersByTreeId = (state: RootState) => state.familyTree.membersByTreeId;

// Memoized selector (stable output reference for same inputs)
export const selectCurrentTreeMembers = createSelector(
  [selectCurrentTreeId, selectMembersByTreeId],
  (treeId, membersByTreeId): readonly PersonSummaryDto[] => {
    if (!treeId) {
      return EMPTY_MEMBERS;
    }

    return membersByTreeId[treeId] ?? EMPTY_MEMBERS;
  }
);

export default familyTreeSlice.reducer;