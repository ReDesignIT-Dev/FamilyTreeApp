import apiClient from "@/services/axiosConfig";
import {
  API_PASSWORD_RESET_URL,
  API_ACTIVATE_USER_URL,
  API_REGISTER_USER_URL,
  API_LOGIN_USER_URL,
  API_LOGOUT_USER_URL,
} from "@/config";
import { getValidatedToken, removeToken, removeUserData, setToken } from "@/utils/cookies";
import { apiErrorHandler } from "../apiErrorHandler";
import { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import { getHeaders } from "@/utils/utils";
import type {
  LoginData,
  RegisterData,
  PasswordResetData,
  PasswordRecoveryData,
  AuthTokenResponse,
  MessageResponse,
} from "./authTypes";

type ApiResponse<T = unknown> = AxiosResponse<T>;

function handleApiError(error: unknown): void {
  if (error instanceof AxiosError) {
    apiErrorHandler(error);
  } else {
    throw new Error("An unexpected error occurred");
  }
}

async function makePostRequest<T>(
  endpoint: string,
  data: object,
  additionalHeaders?: Record<string, string>
): Promise<ApiResponse<T> | undefined> {
  try {
    const response = await apiClient.post<T>(endpoint, data, {
      headers: getHeaders(additionalHeaders),
    });
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function postLogin({
  email,
  password,
  recaptchaToken,
}: LoginData): Promise<ApiResponse<AuthTokenResponse> | undefined> {
  const encodedAuthString = btoa(`${email}:${password}`);

  const response = await makePostRequest<AuthTokenResponse>(
    API_LOGIN_USER_URL,
    { recaptchaToken },
    { Authorization: `Basic ${encodedAuthString}` }
  );

  if (response?.data?.token) {
    setToken(response.data.token);
  }
  return response;
}

export async function registerUser(data: RegisterData): Promise<ApiResponse<MessageResponse> | undefined> {
  return makePostRequest<MessageResponse>(API_REGISTER_USER_URL, data);
}

export async function getData(endpoint: string): Promise<ApiResponse | undefined> {
  try {
    const response = await apiClient.get(endpoint);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function getDataUsingUserToken(
  endpoint: string,
  token: string
): Promise<ApiResponse | undefined> {
  try {
    const response = await apiClient.get(endpoint, {
      headers: getHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function activateUser(
  userId: number,
  token: string
): Promise<ApiResponse | undefined> {
  const url = `${API_ACTIVATE_USER_URL}?userId=${userId}&token=${encodeURIComponent(token)}`;
  return getData(url);
}

export async function validatePasswordResetToken(
  userId: string,
  token: string
): Promise<ApiResponse | undefined> {
  try {
    const response = await apiClient.get(
      `${API_PASSWORD_RESET_URL}/${userId}?token=${encodeURIComponent(token)}`
    );
    return response;
  } catch (error: unknown) {
    handleApiError(error);
  }
}

export async function postPasswordReset(
  userId: string,
  token: string,
  data: PasswordResetData
): Promise<ApiResponse | undefined> {
  return makePostRequest(
    `${API_PASSWORD_RESET_URL}/${userId}?token=${encodeURIComponent(token)}`,
    data
  );
}

export async function postPasswordRecovery(
  data: PasswordRecoveryData
): Promise<ApiResponse | undefined> {
  return makePostRequest(API_PASSWORD_RESET_URL, data);
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post(API_LOGOUT_USER_URL);
  } catch {
  } finally {
    removeToken();
    removeUserData();
  }
}