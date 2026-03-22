import { useState, useRef, useEffect } from "react";
import type { Task, Status, TaskType, User } from "../types/project";
import { MOCK_TASKS, MOCK_USERS } from "../mocks/board";

export interface DropdownState {
  type: "user" | "status" | "date" | "type" | null;
  taskId: number | null;
  position?: { top: number; left: number; maxHeight: number };
}

export function useListView() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownState>({
    type: null,
    taskId: null,
  });

  const dropdownRef = useRef<HTMLDivElement>(null!);
  const filterRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setOpenDropdown({ type: null, taskId: null });
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(task.status);
    const matchesUser =
      selectedUsers.length === 0 ||
      (task.assigned_to && selectedUsers.includes(task.assigned_to.id));
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(task.type);
    return matchesSearch && matchesStatus && matchesUser && matchesType;
  });

  function openDropdownWithPosition(
    e: React.MouseEvent,
    type: DropdownState["type"],
    taskId: number,
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = type === "date" ? 100 : 200;

    let top = rect.bottom + window.scrollY + 4;
    let maxHeight = Math.min(estimatedHeight, spaceBelow - 20);

    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      top =
        rect.top + window.scrollY - Math.min(estimatedHeight, spaceAbove - 20);
      maxHeight = Math.min(estimatedHeight, spaceAbove - 20);
    }

    setOpenDropdown({
      type,
      taskId,
      position: { top, left: rect.left + window.scrollX, maxHeight },
    });
  }

  function closeDropdown() {
    setOpenDropdown({ type: null, taskId: null });
  }

  function handleAssignUser(taskId: number, user: User | null) {
    setTasks((p) =>
      p.map((t) => (t.id === taskId ? { ...t, assigned_to: user } : t)),
    );
    closeDropdown();
  }

  function handleStatusChange(taskId: number, status: Status) {
    setTasks((p) => p.map((t) => (t.id === taskId ? { ...t, status } : t)));
    closeDropdown();
  }

  function handleTypeChange(taskId: number, type: TaskType) {
    setTasks((p) => p.map((t) => (t.id === taskId ? { ...t, type } : t)));
    closeDropdown();
  }

  function handleDeadlineChange(taskId: number, deadline: string) {
    setTasks((p) => p.map((t) => (t.id === taskId ? { ...t, deadline } : t)));
    closeDropdown();
  }

  function toggleFilterStatus(status: string) {
    setSelectedStatuses((p) =>
      p.includes(status) ? p.filter((s) => s !== status) : [...p, status],
    );
  }

  function toggleFilterUser(userId: number) {
    setSelectedUsers((p) =>
      p.includes(userId) ? p.filter((id) => id !== userId) : [...p, userId],
    );
  }

  function toggleFilterType(type: string) {
    setSelectedTypes((p) =>
      p.includes(type) ? p.filter((t) => t !== type) : [...p, type],
    );
  }

  function clearFilters() {
    setSelectedStatuses([]);
    setSelectedUsers([]);
    setSelectedTypes([]);
  }

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedUsers.length > 0 ||
    selectedTypes.length > 0;

  return {
    tasks,
    filteredTasks,
    users: MOCK_USERS,
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
  };
}
