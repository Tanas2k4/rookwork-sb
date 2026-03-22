import { NavLink } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoSidebarCollapse } from "react-icons/go";
import { IoCalendarOutline, IoSettingsOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { BsCalendar2Event, BsFolder } from "react-icons/bs";
import { AiOutlineCheckSquare } from "react-icons/ai";

interface SidebarProps {
  sidebar: boolean;
  setSidebar: Dispatch<SetStateAction<boolean>>;
}

interface Project {
  key: string;
  name: string;
  icon: string;
  color: string;
}

const Sidebar = ({ sidebar, setSidebar }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  // Mock data - thay bằng data thật từ API/state management
  const projects: Project[] = [
    {
      key: "demo",
      name: "Mobile Application",
      icon: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
      color: "bg-purple-100",
    },
    {
      key: "web",
      name: "Web Dashboard",
      icon: "https://cdn-icons-png.flaticon.com/512/732/732190.png",
      color: "bg-blue-100",
    },
    {
      key: "api",
      name: "Backend API",
      icon: "https://cdn-icons-png.flaticon.com/512/2091/2091665.png",
      color: "bg-green-100",
    },
  ];

  const isProjectActive = (projectKey: string) => {
    return location.pathname.includes(`/projects/${projectKey}`);
  };

  const handleProjectClick = (projectKey: string) => {
    navigate(`/projects/${projectKey}/overview`);
    // Đóng sidebar trên mobile sau khi click
    if (window.innerWidth < 768) {
      setSidebar(false);
    }
  };

  return (
    <>
      {/* Overlay (mobile only) */}
      {sidebar && (
        <div
          onClick={() => setSidebar(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:static z-50
          top-0 left-0 h-full
          bg-white text-gray-700 text-[14px]
          border-r border-gray-200
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${sidebar ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-16"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* ===== HEADER ===== */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setSidebar(!sidebar)}
              className="flex items-center w-full h-14 px-1 hover:bg-gray-50 transition-colors"
            >
              <div className="w-14 flex justify-center items-center shrink-0">
                <GoSidebarCollapse
                  size={20}
                  className={`transition-transform duration-300 ${!sidebar ? "rotate-180" : ""}`}
                />
              </div>
              <span
                className={`font-semibold text-gray-800 whitespace-nowrap transition-all duration-300 ${
                  sidebar
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-3"
                }`}
              >
                Workspace
              </span>
            </button>
          </div>

          {/* ===== NAVIGATION ===== */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
            <nav className="flex flex-col gap-1 px-2">
              {/* Tasks */}
              <NavLink
                to="/my-issues"
                className={({ isActive }) =>
                  `flex items-center h-10 rounded-lg transition-colors group ${
                    isActive
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "hover:bg-gray-100"
                  }`
                }
              >
                <div className="w-12 flex justify-center items-center shrink-0">
                  <AiOutlineCheckSquare
                    size={20}
                    className="transition-colors"
                  />
                </div>
                <span
                  className={`truncate transition-all duration-300 ${
                    sidebar ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Issues
                </span>
              </NavLink>

              {/* Events */}
              <button className="flex items-center h-10 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="w-12 flex justify-center items-center shrink-0">
                  <BsCalendar2Event
                    size={17}
                    className="text-gray-600 group-hover:text-purple-600"
                  />
                </div>
                <span
                  className={`truncate transition-all duration-300 group-hover:text-purple-600 ${
                    sidebar ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Events
                </span>
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-gray-200" />

              {/* Projects Section */}
              <div>
                <button
                  onClick={() =>
                    sidebar && setProjectsExpanded(!projectsExpanded)
                  }
                  className="flex items-center w-full h-10 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-12 flex justify-center items-center shrink-0">
                    <BsFolder
                      size={17}
                      className="text-gray-600 group-hover:text-purple-600"
                    />
                  </div>
                  <span
                    className={`flex-1 text-left font-medium truncate transition-all duration-300 group-hover:text-purple-600 ${
                      sidebar ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Projects
                  </span>
                  {sidebar && (
                    <div className="w-8 flex justify-center items-center shrink-0">
                      {projectsExpanded ? (
                        <MdKeyboardArrowDown
                          size={20}
                          className="text-gray-500"
                        />
                      ) : (
                        <MdKeyboardArrowRight
                          size={20}
                          className="text-gray-500"
                        />
                      )}
                    </div>
                  )}
                </button>

                {/* Projects List */}
                {projectsExpanded && (
                  <div
                    className={`flex flex-col gap-0.5 mt-1 transition-all duration-300 ${
                      sidebar ? "opacity-100" : "opacity-0 hidden"
                    }`}
                  >
                    {projects.map((project) => (
                      <button
                        key={project.key}
                        onClick={() => handleProjectClick(project.key)}
                        className={`flex items-center h-9 rounded-lg transition-colors ml-3 ${
                          isProjectActive(project.key)
                            ? "bg-purple-50 text-purple-700 font-medium"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="w-9 flex justify-center items-center shrink-0">
                          <div
                            className={`w-6 h-6 rounded-md ${project.color} flex items-center justify-center overflow-hidden`}
                          >
                            <img
                              src={project.icon}
                              alt={project.name}
                              className="w-4 h-4 object-cover"
                            />
                          </div>
                        </div>
                        <span className="truncate text-[13px] pr-2">
                          {project.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="border-t border-gray-200 py-2 px-2">
            {/* Calendar */}
            <NavLink
              to="/calendars"
              className={({ isActive }) =>
                `flex items-center w-full h-10 rounded-lg transition-colors group
       ${
         isActive
           ? "bg-purple-50 text-purple-700 font-medium"
           : "hover:bg-gray-100"
       }`
              }
            >
              <div className="w-12 flex justify-center items-center shrink-0">
                <IoCalendarOutline size={20} className="transition-colors" />
              </div>
              <span
                className={`truncate transition-all duration-300 ${
                  sidebar ? "opacity-100" : "opacity-0"
                }`}
              >
                Calendar
              </span>
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/settings" // thay đổi đường dẫn nếu route settings khác
              className={({ isActive }) =>
                `flex items-center w-full h-10 rounded-lg transition-colors group
       ${
         isActive
           ? "bg-purple-50 text-purple-700 font-medium"
           : "hover:bg-gray-100"
       }`
              }
            >
              <div className="w-12 flex justify-center items-center shrink-0">
                <IoSettingsOutline size={20} className="transition-colors " />
              </div>
              <span
                className={`truncate transition-all duration-300 ${
                  sidebar ? "opacity-100" : "opacity-0"
                }`}
              >
                Settings
              </span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
