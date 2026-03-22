import { apiClient } from "./apiClient";
import type { CommentResponse, CreateCommentRequest } from "./contracts/comment";

export const commentApi = {
  getByIssue: (projectId: string, issueId: string) =>
    apiClient.get<CommentResponse[]>(
      `/api/projects/${projectId}/issues/${issueId}/comments`,
    ),

  create: (projectId: string, issueId: string, data: CreateCommentRequest) =>
    apiClient.post<CommentResponse>(
      `/api/projects/${projectId}/issues/${issueId}/comments`,
      data,
    ),

  update: (
    projectId: string,
    issueId: string,
    commentId: string,
    data: CreateCommentRequest,
  ) =>
    apiClient.put<CommentResponse>(
      `/api/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
      data,
    ),

  delete: (projectId: string, issueId: string, commentId: string) =>
    apiClient.delete<void>(
      `/api/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    ),
};