"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/config";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Unlock,
  XCircle,
  FileSpreadsheet,
  Clock,
  ExternalLink,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  userId?: string | null;
  roleName?: string | null;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/notifications?limit=25`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds for background updates
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchNotifications, isOpen]);

  // Handle open dropdown
  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
    setIsOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const token = Cookies.get("token");
    if (!token) return;

    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      setMarkingAll(true);
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.linkUrl) {
      router.push(item.linkUrl);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return "เมื่อสักครู่";
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
      if (diffDay < 7) return `${diffDay} วันที่แล้ว`;

      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getNotificationIcon = (title: string, message: string) => {
    const text = `${title} ${message}`;
    if (text.includes("อนุมัติแล้ว") || text.includes("APPROVE")) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      );
    }
    if (text.includes("ขอแก้ไข") || text.includes("EDIT_REQUESTED")) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
      );
    }
    if (text.includes("อนุญาต") || text.includes("ปลดล็อก")) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Unlock className="w-4 h-4 text-blue-600" />
        </div>
      );
    }
    if (text.includes("ปฏิเสธ")) {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <XCircle className="w-4 h-4 text-rose-600" />
        </div>
      );
    }
    if (text.includes("คำขออนุมัติ") || text.includes("รอการตรวจสอบ")) {
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-indigo-600" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        <FileSpreadsheet className="w-4 h-4 text-slate-600" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={`relative rounded-full transition-all duration-200 w-10 h-10 ${
          isOpen ? "bg-blue-100 text-blue-600" : "bg-[#e4e6eb] hover:bg-[#d8dadf] text-black"
        }`}
        title="การแจ้งเตือน"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-md animate-in zoom-in-50 border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="font-semibold text-sm">การแจ้งเตือน</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="text-xs text-white/90 hover:text-white hover:bg-white/20 h-7 px-2 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  อ่านทั้งหมด
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  fetchNotifications();
                  fetchUnreadCount();
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7 rounded-full"
                title="รีเฟรช"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Body / Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-xs">กำลังโหลดการแจ้งเตือน...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">ไม่มีการแจ้งเตือน</p>
                <p className="text-xs text-gray-400 mt-0.5">คุณได้รับข้อมูลข่าวสารล่าสุดทั้งหมดแล้ว</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 relative group ${
                    !item.isRead
                      ? "bg-blue-50/70 hover:bg-blue-100/60"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {/* Icon */}
                  {getNotificationIcon(item.title, item.message)}

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs font-semibold leading-snug truncate ${
                          !item.isRead ? "text-gray-900 font-bold" : "text-gray-700"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-1">
                      {item.message}
                    </p>
                    {item.linkUrl && (
                      <div className="flex items-center text-[11px] text-blue-600 font-medium group-hover:underline">
                        <span>ดูรายละเอียด</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    )}
                  </div>

                  {/* Unread indicator dot */}
                  {!item.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
              <span className="text-[11px] text-gray-400 font-medium">
                แสดงการแจ้งเตือน {notifications.length} รายการล่าสุด
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
