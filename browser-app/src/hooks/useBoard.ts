import { useState, useRef } from "react";
import type {
  Task,
  Comment,
  Toast,
  Status,
  Priority,
  TaskType,
  User,
  Subtask,
} from "../types/project";
import { statusMap, priorityLabelMap } from "../types/project";
import { MOCK_TASKS, MOCK_COMMENTS, CURRENT_USER } from "../mocks/board";
import { formatNow } from "../utils/date";

export function useBoard() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toastIdRef = useRef(0);
  const idRef = useRef(100000);

  // ID / Toast helpers
  function getNextId() {
    return ++idRef.current;
  }

  function pushToast(message: string, type: Toast["type"] = "success") {
    const id = ++toastIdRef.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }

  function removeToast(id: number) {
    setToasts((p) => p.filter((t) => t.id !== id));
  }

  // Core task updater
  function updateTask(id: number, patch: Partial<Task>) {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (selectedTask?.id === id)
      setSelectedTask((p) => (p ? { ...p, ...patch } : p));
  }

  // Panel
  function openTask(task: Task) {
    const fresh = tasks.find((t) => t.id === task.id) ?? task;
    setSelectedTask(fresh);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  }

  // Hierarchy
  function linkChild(parentId: number, childId: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === parentId)
          return { ...t, childIds: [...(t.childIds ?? []), childId] };
        if (t.id === childId) return { ...t, parentId };
        return t;
      }),
    );
    if (selectedTask?.id === parentId)
      setSelectedTask((p) =>
        p ? { ...p, childIds: [...(p.childIds ?? []), childId] } : p,
      );
    pushToast("Linked successfully");
  }

  function unlinkChild(parentId: number, childId: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === parentId)
          return {
            ...t,
            childIds: (t.childIds ?? []).filter((id) => id !== childId),
          };
        if (t.id === childId) return { ...t, parentId: null };
        return t;
      }),
    );
    if (selectedTask?.id === parentId)
      setSelectedTask((p) =>
        p
          ? {
              ...p,
              childIds: (p.childIds ?? []).filter((id) => id !== childId),
            }
          : p,
      );
    pushToast("Unlinked", "info");
  }

  // CRUD
  function createTask(
    title: string,
    type: TaskType,
    priority: Priority,
    status: Status,
  ) {
    const task: Task = {
      id: getNextId(),
      title,
      type,
      priority,
      assigned_to: null,
      deadline: new Date().toISOString().split("T")[0],
      status,
      subtasks: [],
      parentId: null,
      childIds: [],
    };
    setTasks((p) => [...p, task]);
    pushToast("Task created successfully");
    return task;
  }

  function deleteTask(task: Task) {
    if (task.parentId) {
      setTasks((p) =>
        p.map((t) =>
          t.id === task.parentId
            ? {
                ...t,
                childIds: (t.childIds ?? []).filter((id) => id !== task.id),
              }
            : t,
        ),
      );
    }
    (task.childIds ?? []).forEach((cid) => {
      setTasks((p) =>
        p.map((t) => (t.id === cid ? { ...t, parentId: null } : t)),
      );
    });
    setTasks((p) => p.filter((t) => t.id !== task.id));
    setComments((p) => p.filter((c) => c.taskId !== task.id));
    closePanel();
    pushToast("Task deleted", "info");
  }

  function saveTitle(title: string) {
    if (!selectedTask || !title.trim()) return;
    updateTask(selectedTask.id, { title: title.trim() });
    pushToast("Title updated");
  }

  function saveDescription(description: string) {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { description });
    pushToast("Description updated");
  }

  function changeStatus(s: Status) {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { status: s });
    pushToast(`Status → ${statusMap[s].label}`);
  }

  function changeTaskStatus(task: Task, newStatus: Status) {
    if (task.status === newStatus) return;
    updateTask(task.id, { status: newStatus });
    pushToast(`${task.title} moved to ${statusMap[newStatus].label}`);
  }

  function reorderTasks(taskId: number, fromIndex: number, toIndex: number) {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      // Get all tasks with the same status as the dragged task
      const sameStatusTasks = prev.filter((t) => t.status === task.status);

      // Remove task from old position
      sameStatusTasks.splice(fromIndex, 1);

      // Insert at new position
      if (toIndex >= sameStatusTasks.length) {
        sameStatusTasks.push(task);
      } else {
        sameStatusTasks.splice(toIndex, 0, task);
      }

      // Rebuild full array by replacing tasks with same status
      let reorderedIndex = 0;
      return prev.map((t) => {
        if (t.status === task.status) {
          return sameStatusTasks[reorderedIndex++];
        }
        return t;
      });
    });
    pushToast("Task reordered");
  }

  function changePriority(p: Priority) {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { priority: p });
    pushToast(`Priority → ${priorityLabelMap[p]}`);
  }

  function changeAssignee(u: User | null) {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { assigned_to: u });
    pushToast(u ? `Assigned to ${u.display_name}` : "Unassigned");
  }

  function saveDeadline(val: string) {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { deadline: val });
    pushToast("Deadline updated");
  }

  // Subtasks
  function toggleSubtask(subtaskId: number) {
    if (!selectedTask) return;
    const updated = selectedTask.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, done: !s.done } : s,
    );
    updateTask(selectedTask.id, { subtasks: updated });
  }

  function addSubtask(title: string) {
    if (!selectedTask || !title.trim()) return;
    const newSub: Subtask = {
      id: getNextId(),
      title: title.trim(),
      done: false,
    };
    updateTask(selectedTask.id, {
      subtasks: [...selectedTask.subtasks, newSub],
    });
    pushToast("Subtask added");
  }

  function deleteSubtask(subtaskId: number) {
    if (!selectedTask) return;
    updateTask(selectedTask.id, {
      subtasks: selectedTask.subtasks.filter((s) => s.id !== subtaskId),
    });
    pushToast("Subtask removed", "info");
  }

  // Comments
  function submitComment(content: string, parentId?: number) {
    if (!selectedTask || !content.trim()) return;
    const c: Comment = {
      id: getNextId(),
      taskId: selectedTask.id,
      userId: CURRENT_USER.id,
      content: content.trim(),
      createdAt: formatNow(),
      parentId: parentId ?? null,
    };
    setComments((p) => [...p, c]);
    pushToast(parentId ? "Reply posted" : "Comment posted");
  }

  function editComment(id: number, content: string) {
    if (!content.trim()) return;
    setComments((p) =>
      p.map((c) => (c.id === id ? { ...c, content: content.trim() } : c)),
    );
    pushToast("Comment updated");
  }

  function deleteComment(id: number) {
    setComments((p) => p.filter((c) => c.id !== id));
    pushToast("Comment deleted", "info");
  }

  // Derived
  const taskComments = selectedTask
    ? comments.filter((c) => c.taskId === selectedTask.id)
    : [];

  return {
    // state
    tasks,
    comments,
    taskComments,
    selectedTask,
    panelOpen,
    toasts,
    // panel
    openTask,
    closePanel,
    // hierarchy
    linkChild,
    unlinkChild,
    // crud
    createTask,
    deleteTask,
    saveTitle,
    saveDescription,
    changeStatus,
    changeTaskStatus,
    changePriority,
    changeAssignee,
    saveDeadline,
    // reorder
    reorderTasks,
    // subtasks
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    // comments
    submitComment,
    editComment,
    deleteComment,
    // toasts
    removeToast,
  };
}
