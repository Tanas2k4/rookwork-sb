import { useState, useEffect } from "react";
import { ImPencil } from "react-icons/im";
import { FaLink } from "react-icons/fa6";
import { IoAdd, IoClose } from "react-icons/io5";
import { RiUserAddLine } from "react-icons/ri";
import { FaTasks, FaBook, FaRocket } from "react-icons/fa";

type TaskType = "task" | "story" | "epic";

// Mock data for participants
const Users = [
  {
    id: 1,
    email: "bongbo355@gmail.com",
    display_name: "Trần Tấn",
    avt: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    email: "khar34@gmail.com",
    display_name: "Phạm Hoàng Tuấn Kha",
    avt: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    email: "nak@gmial.com",
    display_name: "Nguyễn An Khang",
    avt: "https://i.pravatar.cc/150?img=3",
  },
];

// Configuration for task types
const TYPE_OPTIONS = [
  {
    value: "task" as const,
    label: "Task",
    icon: <FaTasks size={16} />,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    activeColor: "bg-blue-100 border-blue-500",
    description: "A single piece of work",
  },
  {
    value: "story" as const,
    label: "Story",
    icon: <FaBook size={16} />,
    color: "bg-green-50 text-green-700 border-green-200",
    activeColor: "bg-green-100 border-green-500",
    description: "A user-facing feature",
  },
  {
    value: "epic" as const,
    label: "Epic",
    icon: <FaRocket size={16} />,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    activeColor: "bg-purple-100 border-purple-500",
    description: "A large body of work",
  },
] as const;

function ProjectHeader() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedType, setSelectedType] = useState<TaskType>("task");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showCreateTask ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCreateTask]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log("Adding user:", email);
      setEmail("");
      setShowAddUser(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      console.log("Creating:", {
        type: selectedType,
        title: taskTitle,
        description: taskDescription,
        dueDate,
      });
      resetTaskForm();
    }
  };

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setSelectedType("task");
    setDueDate("");
    setShowCreateTask(false);
  };

  const closeAddUser = () => {
    setShowAddUser(false);
    setEmail("");
  };

  return (
    <>
      <div className="py-3 px-8 bg-white">
        <div className="flex flex-row items-center gap-3 mb-3">
          <h1 className="text-5xl font-bold text-gray-800">Mobile App</h1>
          <button className="text-purple-700 p-1.5 bg-purple-100 hover:bg-purple-200 rounded-lg transition">
            <ImPencil size={14} />
          </button>
          <button className="text-purple-700 p-1.5 bg-purple-100 hover:bg-purple-200 rounded-lg transition">
            <FaLink size={14} />
          </button>
        </div>

        <div className="flex gap-3 items-center">
          {/* Create task */}
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex flex-row items-center gap-1.5 px-3 py-1.5 text-sm
             text-gray-700 border border-gray-500 rounded-md transition font-medium"
          >
            Create task
            <IoAdd size={18} />
          </button>

          {/* Add user to project */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className={`flex items-center justify-center w-8 h-8 text-gray-700 
            border border-gray-500 hover:bg-gray-200 rounded-full transition ${
              showAddUser ? "bg-gray-100" : ""
            }`}
            >
              <RiUserAddLine size={18} />
            </button>
            {/* Participants */}
            <div className="flex -space-x-2">
              {Users.map((user) => (
                <img
                  key={user.id}
                  src={user.avt}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  title={user.display_name}
                />
              ))}
            </div>
            <div
              className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
                showAddUser ? "w-80 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-3 py-1.5 text-sm border border-gray-500 rounded-md 
                focus:outline-none focus:ring-1 focus:ring-inset focus:border-none focus:ring-purple-500 transition"
                autoFocus={showAddUser}
              />
              <button
                onClick={handleAddUser}
                className="px-3 py-1.5 text-sm font-medium text-gray-200 
                bg-purple-900 hover:bg-purple-700 rounded-md transition whitespace-nowrap"
              >
                Send
              </button>
              <button
                onClick={closeAddUser}
                className="p-1.5 text-gray-500 hover:text-gray-600 bg-gray-200 hover:bg-gray-200
                 rounded-full transition"
              >
                <IoClose size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={resetTaskForm}
          />

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Create new Item
              </h2>
              <button
                onClick={resetTaskForm}
                className="p-1.5 text-gray-400 bg-gray-200 hover:text-gray-600 rounded-full transition"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleCreateTask}
              className="flex-1 overflow-y-auto"
            >
              <div className="px-6 py-5 space-y-5">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedType(option.value)}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition ${
                          selectedType === option.value
                            ? option.activeColor
                            : `${option.color} border-transparent hover:border-gray-300`
                        }`}
                      >
                        <div className="text-2xl">{option.icon}</div>
                        <div className="text-sm font-semibold">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-600 text-center">
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={`Enter ${selectedType} title...`}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={6}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent
                      resize-none"
                  />
                </div>

                {/* Assignee + Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignee
                    </label>
                    <select
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Unassigned</option>
                      <option value="1">Trần Tấn</option>
                      <option value="2">Nguyễn Văn A</option>
                      <option value="3">Lê Thị B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Due date + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due date
                    </label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="to_do">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={resetTaskForm}
                  className="px-4 py-2 text-sm font-medium border border-gray-500 text-gray-700 
                    hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-purple-900 hover:bg-purple-800 rounded-lg transition"
                >
                  Create {selectedType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectHeader;