import { useState, useRef, useEffect, useCallback } from "react";
import { useContext } from "react";
import type { Task, Status, TaskType, User } from "../types/project";
import type { IssueResponse, UpdateIssueRequest } from "../api/contracts/issue";
import type { UserSummary } from "../api/contracts/issue";
import type { Toast } from "../types/project";
import { issueApi } from "../api/services/issueApi";
import { ProjectContext } from "../context/ProjectContext";

//  Mapping helpers 

function apiStatusToUI(s: IssueResponse["status"]): Status {
  if (!s) return "to_do";
  const map: Record<NonNullable<IssueResponse["status"]>, Status> = {
    TO_DO: "to_do",
    IN_PROGRESS: "in_progress",
    DONE: "done",
  };
  return map[s];
}

function uiStatusToApi(s: Status): NonNullable<IssueResponse["status"]> {
  const map: Record<Status, NonNullable<IssueResponse["status"]>> = {
    to_do: "TO_DO",
    in_progress: "IN_PROGRESS",
    done: "DONE",
  };
  return map[s];
}

function apiTypeToUI(t: IssueResponse["issueType"]): Task["type"] {
  return t.toLowerCase() as Task["type"];
}

function apiUserToUI(u: UserSummary): User {
  return {
    id: 0,
    email: "",
    display_name: u.profileName,
    avt:
      u.picture ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.profileName)}&background=7c3aed&color=fff`,
  };
}

function issueToTask(issue: IssueResponse): Task & { _uuid: string; _assigneeUuid?: string } {
  return {
    _uuid: issue.id,
    id: 0,
    title: issue.issueName,
    description: issue.description ?? undefined,
    type: apiTypeToUI(issue.issueType),
    priority: (issue.priority?.toLowerCase() as Task["priority"]) ?? "medium",
    status: apiStatusToUI(issue.status),
    assigned_to: issue.assignedTo ? apiUserToUI(issue.assignedTo) : null,
    deadline: issue.deadline ?? null,
    subtasks: [],
    parentId: null,
    childIds: [],
    _assigneeUuid: issue.assignedTo?.id,
  };
}

//  Types 

export interface DropdownState {
  type: "user" | "status" | "date" | "type" | null;
  taskId: string | null;
  position?: { top: number; left: number; maxHeight: number };
}

//  Hook 

export function useListView() {
  const { projectId } = useContext(ProjectContext);

  const [tasks, setTasks]                   = useState<(Task & { _uuid: string; _assigneeUuid?: string })[]>([]);
  const [users, setUsers]                   = useState<User[]>([]);
  const [searchQuery, setSearchQuery]       = useState("");
  const [filterOpen, setFilterOpen]         = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers]   = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes]   = useState<string[]>([]);
  const [openDropdown, setOpenDropdown]     = useState<DropdownState>({ type: null, taskId: null });
  const [tick, setTick]                     = useState(0);
  const [toasts, setToasts]                 = useState<Toast[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null!);
  const filterRef   = useRef<HTMLDivElement>(null!);

  //  Toast helpers 

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  //  Fetch issues 

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    issueApi
      .getAll(projectId)
      .then((issues) => {
        if (cancelled) return;
        const mapped = issues.map(issueToTask);
        setTasks(mapped);

        const seen = new Set<string>();
        const assignees: User[] = [];
        issues.forEach((i) => {
          if (i.assignedTo && !seen.has(i.assignedTo.id)) {
            seen.add(i.assignedTo.id);
            assignees.push(apiUserToUI(i.assignedTo));
          }
        });
        setUsers(assignees);
      })
      .catch(() => addToast("Failed to load issues", "error"));

    return () => { cancelled = true; };
  }, [projectId, tick]);

  //  Close on outside click 

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpenDropdown({ type: null, taskId: null });
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //  Filter 

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch  = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus  = selectedStatuses.length === 0 || selectedStatuses.includes(task.status);
    const matchesUser    = selectedUsers.length === 0 || selectedUsers.includes(task._assigneeUuid ?? "");
    const matchesType    = selectedTypes.length === 0 || selectedTypes.includes(task.type);
    return matchesSearch && matchesStatus && matchesUser && matchesType;
  });

  //  Dropdown position 

  function openDropdownWithPosition(e: React.MouseEvent, type: DropdownState["type"], taskId: string) {
    const rect           = e.currentTarget.getBoundingClientRect();
    const spaceBelow     = window.innerHeight - rect.bottom;
    const spaceAbove     = rect.top;
    const estimatedHeight = type === "date" ? 120 : 200;

    let top       = rect.bottom + window.scrollY + 4;
    let maxHeight = Math.min(estimatedHeight, spaceBelow - 20);

    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      top       = rect.top + window.scrollY - Math.min(estimatedHeight, spaceAbove - 20);
      maxHeight = Math.min(estimatedHeight, spaceAbove - 20);
    }

    setOpenDropdown({ type, taskId, position: { top, left: rect.left + window.scrollX, maxHeight } });
  }

  function closeDropdown() {
    setOpenDropdown({ type: null, taskId: null });
  }

  //  API update helper 

  async function updateIssue(taskId: string, data: UpdateIssueRequest, successMsg: string) {
    if (!projectId) return;
    try {
      await issueApi.update(projectId, taskId, data);
      addToast(successMsg, "success");
    } catch {
      addToast("Update failed. Please try again.", "error");
      // Rollback: reload from server
      setTick((n) => n + 1);
    }
  }

  //  Handlers 

  function handleAssignUser(taskId: string, user: User & { _uuid?: string } | null) {
    // Optimistic
    setTasks((p) => p.map((t) => t._uuid === taskId ? { ...t, assigned_to: user } : t));
    closeDropdown();

    const assignedToId = (user as (User & { _uuid?: string }) | null)?._uuid ?? null;
    updateIssue(taskId, { assignedToId: assignedToId ?? undefined }, 
      user ? `Assigned to ${user.display_name}` : "Assignee removed"
    );
  }

  function handleStatusChange(taskId: string, status: Status) {
    // Optimistic
    setTasks((p) => p.map((t) => t._uuid === taskId ? { ...t, status } : t));
    closeDropdown();

    updateIssue(taskId, { status: uiStatusToApi(status) }, `Status → ${status.replace("_", " ")}`);
  }

  function handleTypeChange(taskId: string, type: TaskType) {
    // Optimistic update only — issueType is not in UpdateIssueRequest
    setTasks((p) => p.map((t) => t._uuid === taskId ? { ...t, type } : t));
    closeDropdown();
    // NOTE: API không có field issueType trong UpdateIssueRequest, bỏ qua API call
  }

  function handleDeadlineChange(taskId: string, deadline: string) {
    // Optimistic
    setTasks((p) => p.map((t) => t._uuid === taskId ? { ...t, deadline: deadline || null } : t));
    closeDropdown();

    // datetime-local trả về "YYYY-MM-DDTHH:mm", Spring nhận "YYYY-MM-DDTHH:mm:ss"
    const formatted = deadline ? `${deadline}:00` : undefined;
    updateIssue(taskId, { deadline: formatted },
      deadline ? "Deadline updated" : "Deadline cleared"
    );
  }

  //  Filter toggles 

  function toggleFilterStatus(status: string) {
    setSelectedStatuses((p) => p.includes(status) ? p.filter((s) => s !== status) : [...p, status]);
  }

  function toggleFilterUser(uuid: string) {
    setSelectedUsers((p) => p.includes(uuid) ? p.filter((id) => id !== uuid) : [...p, uuid]);
  }

  function toggleFilterType(type: string) {
    setSelectedTypes((p) => p.includes(type) ? p.filter((t) => t !== type) : [...p, type]);
  }

  function clearFilters() {
    setSelectedStatuses([]);
    setSelectedUsers([]);
    setSelectedTypes([]);
  }

  const hasActiveFilters = selectedStatuses.length > 0 || selectedUsers.length > 0 || selectedTypes.length > 0;

  const reload = () => setTick((n) => n + 1);

  return {
    tasks,
    filteredTasks,
    users,
    searchQuery,
    setSearchQuery,
    filterOpen,
    setFilterOpen,
    selectedStatuses,
    selectedUsers,
    selectedTypes,
    toggleFilterStatus,
    toggleFilterUser,
    toggleFilterType,
    clearFilters,
    hasActiveFilters,
    openDropdown,
    dropdownRef,
    filterRef,
    openDropdownWithPosition,
    closeDropdown,
    handleAssignUser,
    handleStatusChange,
    handleTypeChange,
    handleDeadlineChange,
    toasts,
    removeToast,
    reload,
  };
}