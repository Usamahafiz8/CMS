import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; fieldErrors?: Record<string, string[]> }>) => {
    const message = error.response?.data?.error ?? error.message ?? "Something went wrong";
    throw new ApiClientError(message, error.response?.status, error.response?.data?.fieldErrors);
  },
);
