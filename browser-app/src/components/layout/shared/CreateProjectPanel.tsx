import { useState } from "react";
import { MdClose, MdAdd } from "react-icons/md";
import { FaLock, FaGlobe } from "react-icons/fa";
import { BiCheck } from "react-icons/bi";
import ProjectImage from "../../../assets/project-background.jpg";

interface ProjectLog {
  id: number;
  project_name: string;
  access_modifier: "public" | "private";
  created_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  displayName?: string;
  avatarUrl?: string;
}

export function CreateProjectPanel({ open, onClose }: Props) {
  const [projectName, setProjectName] = useState("");
  const [accessModifier, setAccessModifier] = useState<"public" | "private">(
    "private",
  );
  const [logs, setLogs] = useState<ProjectLog[]>([
    {
      id: 1,
      project_name: "Mobile App Dev",
      access_modifier: "private",
      created_at: "2026-02-20T09:15:00",
    },
    {
      id: 2,
      project_name: "Backend Refactor",
      access_modifier: "public",
      created_at: "2026-02-21T14:30:00",
    },
  ]);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }
    setError("");

    const newLog: ProjectLog = {
      id: Math.max(...logs.map((l) => l.id), 99) + 1,
      project_name: projectName.trim(),
      access_modifier: accessModifier,
      created_at: new Date().toISOString(),
    };

    setLogs((p) => [newLog, ...p]);
    setProjectName("");
    setAccessModifier("private");

    // Xóa highlight sau 2s
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-[90] h-full w-full max-w-xl bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-800">
              Create Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Form */}
          <div className="space-y-4">
            {/* Project name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="e.g. Mobile App Dev"
                className={`w-full text-sm  border-2 rounded-lg px-3 py-2 outline-none transition
                ${
                  error
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-purple-500"
                }`}
              />
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>

            {/* Access modifier */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Visibility
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["private", "public"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAccessModifier(opt)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition text-left ${
                      accessModifier === opt
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt === "private" ? (
                      <FaLock
                        size={14}
                        className={
                          accessModifier === opt
                            ? "text-purple-600"
                            : "text-gray-400"
                        }
                      />
                    ) : (
                      <FaGlobe
                        size={14}
                        className={
                          accessModifier === opt
                            ? "text-purple-600"
                            : "text-gray-400"
                        }
                      />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium capitalize ${accessModifier === opt ? "text-purple-700" : "text-gray-700"}`}
                      >
                        {opt}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {opt === "private"
                          ? "Only members can access"
                          : "Anyone can view"}
                      </p>
                    </div>
                    {accessModifier === opt && (
                      <BiCheck
                        className="ml-auto text-purple-600 shrink-0"
                        size={18}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-purple-900 hover:bg-purple-800 text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              <MdAdd size={18} />
              Create Project
            </button>
          </div>

          {/* Log table */}
          <div className="flex items-center justify-center pt-2 w-full ">
            <img src={ProjectImage} className="size-80" alt="project" />
          </div>
        </div>
      </div>
    </>
  );
}
