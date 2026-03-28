import { Link } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { BsBell } from "react-icons/bs";
import { GoSidebarCollapse } from "react-icons/go";
import { IoSearchSharp } from "react-icons/io5";
import { BiPlus } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import SockJS from "sockjs-client";
import { Client, type IMessage } from "@stomp/stompjs";
import rookworkLogo from "../../assets/logo-no-background.png";
import { CreateProjectPanel } from "./shared/CreateProjectPanel";
import { notificationApi } from "../../api/services/notificationApi";
import { tokenStorage } from "../../api/tokenStorage";
import type { NotificationResponse } from "../../api/contracts/notification";
import type { ProjectResponse } from "../../api/contracts";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

interface HeaderProps {
  setSidebar: Dispatch<SetStateAction<boolean>>;
  avatarUrl?: string;
  displayName?: string;
  onLogout?: () => void;
  onProjectCreated?: (p: ProjectResponse) => void;
}

function Header({ setSidebar, avatarUrl, displayName, onLogout, onProjectCreated }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [openCreatePanel, setOpenCreatePanel] = useState(false);
  const isElectron = window.navigator.userAgent.includes("Electron");

  //  Real notifications 
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  const loadNotifications = useCallback(() => {
    notificationApi.getAll().then((all) => {
      const normalized = all.map((n) => ({
        ...n,
        isRead: n.isRead ?? (n as unknown as { read?: boolean }).read ?? false,
      }));
      setNotifications(normalized);
    }).catch((err) => console.error("Failed to load notifications", err));
  }, []);

  // Load on mount
  useEffect(() => {
    let cancelled = false;
    notificationApi.getAll().then((all) => {
      if (!cancelled) {
        // Jackson serialize boolean isRead() → "read" (bỏ prefix "is")
        const normalized = all.map((n) => ({
          ...n,
          isRead: n.isRead ?? (n as unknown as { read?: boolean }).read ?? false,
        }));
        setNotifications(normalized);
      }
    }).catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // WebSocket real-time
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`) as WebSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/user/queue/notifications", (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body);
            if (payload.notificationId) loadNotifications();
          } catch (e) {
            console.error("WS notification parse error", e);
          }
        });
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [loadNotifications]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  //  Original UI logic 

  const handleLogout = () => {
    if (isElectron) window.electron?.logout();
    onLogout?.();
  };

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "T";

  return (
    <>
      {/* Notification Panel Overlay */}
      {openNotification && (
        <div
          onClick={() => setOpenNotification(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[55] transition-opacity duration-300"
        />
      )}

      <header className="font-heading text-sm h-[50px] px-4 bg-white border-b border-gray-300 flex items-center relative z-40">
        <div className="flex items-center justify-between w-full">
          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebar((prev) => !prev)}
            className="md:hidden mr-3 p-2 hover:bg-gray-100 rounded"
          >
            <GoSidebarCollapse size={22} />
          </button>

          {/* Logo */}
          <Link to="/">
            <img src={rookworkLogo} alt="logo" className="h-9 w-36" />
          </Link>

          {/* Search + Create */}
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

          {/* User area */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setOpenNotification((p) => !p)}
                className={`p-2 rounded-full transition ${
                  openNotification ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <BsBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User menu */}
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

      {/* Notification Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] bg-white border-l border-gray-200 z-[60] flex flex-col
          transition-transform duration-300 ease-in-out
          ${openNotification ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-base">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-purple-700 hover:text-purple-900 transition"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setOpenNotification(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition"
            >
              <IoClose size={18} />
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
              <BsBell size={40} className="opacity-30" />
              <span>No notifications</span>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const avatarInitials = n.title
                  .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <li
                    key={n.id}
                    onClick={() => { if (!n.isRead) handleMarkAsRead(n.id); }}
                    className={`hover:bg-gray-100 px-5 py-4 transition cursor-pointer ${
                      !n.isRead ? "bg-purple-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-full bg-purple-200 text-purple-800 text-xs font-bold flex items-center justify-center">
                        {avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug font-semibold">
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5 leading-snug">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(n.createdAt)}
                        </p>
                        {!n.isRead && (
                          <span className="inline-block mt-1 w-2 h-2 bg-purple-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Panel Footer
        <div className="border-t border-gray-200 px-5 py-3">
          <button className="w-full text-center text-sm font-medium text-purple-800 hover:text-purple-900 transition">
            View all notifications
          </button>
        </div> */}
      </div>

      {/* Create Project Panel */}
      <CreateProjectPanel
        open={openCreatePanel}
        onClose={() => setOpenCreatePanel(false)}
        onProjectCreated={onProjectCreated}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />
    </>
  );
}

export default Header;