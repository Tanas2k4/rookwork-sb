import { IoSearchSharp } from "react-icons/io5";
import { LiaSortSolid } from "react-icons/lia";
import { FaCaretDown, FaTasks, FaBook, FaRocket } from "react-icons/fa";
import { useListView } from "../hooks/useListView";
import { ListFilterPanel } from "./list/ListFilterPanel";
import { ListDropdowns } from "./list/ListDropdowns";

const typeOptions = [
  {
    label: "Task",
    value: "task",
    icon: <FaTasks size={12} />,
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Story",
    value: "story",
    icon: <FaBook size={12} />,
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Epic",
    value: "epic",
    icon: <FaRocket size={12} />,
    color: "bg-purple-100 text-purple-700",
  },
];

const statusOptions = [
  { label: "To Do", value: "to_do", color: "bg-gray-100 text-gray-800" },
  {
    label: "In Progress",
    value: "in_progress",
    color: "bg-blue-100 text-blue-800",
  },
  { label: "Done", value: "done", color: "bg-green-100 text-green-800" },
];

export default function ListView() {
  const lv = useListView();

  const getTypeOption = (type: string) =>
    typeOptions.find((t) => t.value === type) ?? typeOptions[0];
  const getStatusOption = (status: string) =>
    statusOptions.find((s) => s.value === status) ?? statusOptions[0];

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="mx-auto px-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-80">
            <IoSearchSharp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={lv.searchQuery}
              onChange={(e) => lv.setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-500 rounded-md pl-9 pr-3 py-1.5 text-sm
                focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-none focus:border-transparent transition"
            />
          </div>

          <ListFilterPanel
            open={lv.filterOpen}
            onToggle={() => lv.setFilterOpen((p) => !p)}
            filterRef={lv.filterRef}
            users={lv.users}
            selectedStatuses={lv.selectedStatuses}
            selectedUsers={lv.selectedUsers}
            selectedTypes={lv.selectedTypes}
            onToggleStatus={lv.toggleFilterStatus}
            onToggleUser={lv.toggleFilterUser}
            onToggleType={lv.toggleFilterType}
            onClear={lv.clearFilters}
            hasActiveFilters={lv.hasActiveFilters}
          />

          <span className="text-sm text-gray-600">
            {lv.filteredTasks.length} task
            {lv.filteredTasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 tracking-wider border-r border-gray-300">
                    Title
                  </th>
                  {["Type", "Assigned to", "Deadline", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-700 tracking-wider border-r border-gray-300"
                    >
                      <div className="flex items-center justify-between">
                        <span>{h}</span>
                        <button className="p-1 hover:bg-gray-300 rounded transition">
                          <LiaSortSolid size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 tracking-wider">
                    Subtasks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lv.filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  lv.filteredTasks.map((task) => {
                    const typeOpt = getTypeOption(task.type);
                    const statusOpt = getStatusOption(task.status);
                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Title */}
                        <td className="px-4 py-3 border-r border-gray-200">
                          <a
                            href="#"
                            className="text-[13px] text-gray-700 hover:text-purple-600 font-medium transition"
                          >
                            {task.title}
                          </a>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div
                            className="flex items-center justify-between cursor-pointer group"
                            onDoubleClick={(e) =>
                              lv.openDropdownWithPosition(e, "type", task.id)
                            }
                          >
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${typeOpt.color}`}
                            >
                              {typeOpt.icon}
                              {typeOpt.label}
                            </span>
                            <button
                              onClick={(e) =>
                                lv.openDropdownWithPosition(e, "type", task.id)
                              }
                              className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
                            >
                              <FaCaretDown className="text-gray-500" />
                            </button>
                          </div>
                        </td>

                        {/* Assigned to */}
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div
                            className="flex items-center justify-between cursor-pointer group"
                            onDoubleClick={(e) =>
                              lv.openDropdownWithPosition(e, "user", task.id)
                            }
                          >
                            {task.assigned_to ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={task.assigned_to.avt}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-[13px] text-gray-700">
                                  {task.assigned_to.display_name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Unassigned
                              </span>
                            )}
                            <button
                              onClick={(e) =>
                                lv.openDropdownWithPosition(e, "user", task.id)
                              }
                              className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
                            >
                              <FaCaretDown className="text-gray-500" />
                            </button>
                          </div>
                        </td>

                        {/* Deadline */}
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div
                            className="group cursor-pointer"
                            onDoubleClick={(e) =>
                              lv.openDropdownWithPosition(e, "date", task.id)
                            }
                          >
                            <span className="text-[13px] text-gray-500">
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString(
                                    "vi-VN",
                                  )
                                : "-"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 border-r border-gray-200">
                          <div
                            className="flex items-center justify-between cursor-pointer group"
                            onDoubleClick={(e) =>
                              lv.openDropdownWithPosition(e, "status", task.id)
                            }
                          >
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${statusOpt.color}`}
                            >
                              {statusOpt.label}
                            </span>
                            <button
                              onClick={(e) =>
                                lv.openDropdownWithPosition(
                                  e,
                                  "status",
                                  task.id,
                                )
                              }
                              className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition"
                            >
                              <FaCaretDown className="text-gray-500" />
                            </button>
                          </div>
                        </td>

                        {/* Subtasks */}
                        <td className="px-4 py-3">
                          {task.subtasks.length > 0 ? (
                            <span className="text-[13px] text-gray-600">
                              {task.subtasks.length} subtask
                              {task.subtasks.length !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ListDropdowns
        openDropdown={lv.openDropdown}
        dropdownRef={lv.dropdownRef}
        tasks={lv.tasks}
        users={lv.users}
        onAssignUser={lv.handleAssignUser}
        onStatusChange={lv.handleStatusChange}
        onTypeChange={lv.handleTypeChange}
        onDeadlineChange={lv.handleDeadlineChange}
      />
    </div>
  );
}
