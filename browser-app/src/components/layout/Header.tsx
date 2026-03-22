import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { BsBell } from "react-icons/bs";
import { GoSidebarCollapse } from "react-icons/go";
import { IoSearchSharp } from "react-icons/io5";
import { BiPlus } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import rookworkLogo from "../../assets/logo-no-background.png";
import { CreateProjectPanel } from "./shared/CreateProjectPanel";
import type { ProjectResponse } from "../../api/contracts/project";
interface HeaderProps {
  setSidebar: Dispatch<SetStateAction<boolean>>;
  avatarUrl?: string;
  displayName?: string;
  onLogout?: () => void;
  onProjectCreated?: (project: ProjectResponse) => void; 
}

interface Notification {
  id: number;
  type: "invite";
  projectName: string;
  invitedBy: string;
  invitedByAvatar?: string;
  role: string;
  time: string;
  status: "pending" | "accepted" | "rejected";
}

function Header({ setSidebar, avatarUrl, displayName, onLogout, onProjectCreated  }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [openCreatePanel, setOpenCreatePanel] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // TODO: fetch real notifications từ API
  // useEffect(() => { notificationApi.getAll().then(setNotifications) }, []);

  const isElectron = window.navigator.userAgent.includes("Electron");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    if (isElectron) window.electron?.logout();
    onLogout?.();
  };

  const handleAccept = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "accepted" } : n)),
    );
  };

  const handleReject = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "rejected" } : n)),
    );
  };

  const pendingCount = notifications.filter(
    (n) => n.status === "pending",
  ).length;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <>
      {openNotification && (
        <div
          onClick={() => setOpenNotification(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[55] transition-opacity duration-300"
        />
      )}

      <header className="font-heading text-sm h-[50px] px-4 bg-white border-b border-gray-300 flex items-center relative z-40">
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => setSidebar((prev) => !prev)}
            className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded"
          >
            <GoSidebarCollapse size={22} />
          </button>

          <Link to="/">
            <img src={rookworkLogo} alt="logo" className="h-9 w-36" />
          </Link>

          <div className="flex gap-3 relative w-max items-center">
            <div className="relative">
              <IoSearchSharp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-200 pl-10 pr-3 py-1 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => setOpenCreatePanel(true)}
              className="flex items-center justify-center bg-purple-900 gap-1 px-3 py-1 rounded-md text-gray-200 hover:bg-purple-800 transition"
            >
              Create
              <BiPlus size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setOpenNotification((p) => !p)}
                className={`p-2 rounded-full transition ${
                  openNotification
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <BsBell size={20} />
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setOpen((p) => !p)}
                className="flex items-center gap-2 text-gray-700 border border-gray-500 rounded-full px-1 py-1 hover:bg-gray-50 transition"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName ?? "avatar"}
                    className="border border-gray-400 size-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-6 rounded-full bg-purple-200 text-purple-800 text-[10px] font-bold flex items-center justify-center">
                    {initials}
                  </div>
                )}
                <FaChevronDown
                  size={11}
                  className={`mr-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <ul className="absolute right-0 mt-2 w-40 bg-white rounded-lg border border-gray-300 text-sm z-50 overflow-hidden">
                  <li className="px-4 py-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <a href="#">Profile</a>
                  </li>
                  <li className="px-4 py-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer">
                    <a href="#">Settings</a>
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-red-50 cursor-pointer text-red-500"
                    onClick={handleLogout}
                  >
                    Log out
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] bg-white border-l border-gray-200 z-[60] flex flex-col
          transition-transform duration-300 ease-in-out
          ${openNotification ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-base">
              Notifications
            </span>
            {pendingCount > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingCount} new
              </span>
            )}
          </div>
          <button
            onClick={() => setOpenNotification(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            <IoClose size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
              <BsBell size={40} className="opacity-30" />
              <span>No notifications</span>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const avatarInitials = n.invitedBy
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <li
                    key={n.id}
                    className={`hover:bg-gray-100 px-5 py-4 transition ${
                      n.status === "pending" ? "bg-purple-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-full bg-purple-200 text-purple-800 text-xs font-bold flex items-center justify-center">
                        {avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">
                          <span className="font-semibold text-gray-900">
                            {n.invitedBy}
                          </span>{" "}
                          invited you to join{" "}
                          <span className="font-semibold text-purple-800">
                            {n.projectName}
                          </span>
                          .
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                        {n.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAccept(n.id)}
                              className="px-3 py-1 bg-purple-900 text-white text-xs font-medium rounded-md hover:bg-purple-800 transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(n.id)}
                              className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-md border border-gray-500 hover:bg-gray-100 transition"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {n.status === "accepted" && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                            Accepted
                          </span>
                        )}
                        {n.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400 font-medium">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-200 px-5 py-3">
          <button className="w-full text-center text-sm font-medium text-purple-800 hover:text-purple-900 transition">
            View all notifications
          </button>
        </div>
      </div>

      <CreateProjectPanel
        open={openCreatePanel}
        onClose={() => setOpenCreatePanel(false)}
        displayName={displayName}
        avatarUrl={avatarUrl}
        onProjectCreated={onProjectCreated}
      />
    </>
  );
}

export default Header;
