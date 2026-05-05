import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  addNotification,
  fetchUnreadCount,
  markAllAsRead,
  markAsRead,
  setNotifications,
  toggleDropdown,
  closeDropdown,
} from "../../../state/notification/notificationSlice";
import { getNotifications } from "../../../api/notification/notificationApi";
import { socketService } from "../../../api/socketService";
import {
  NotificationType,
  type INotification,
} from "../../../types/notification";
import type { AppDispatch, RootState } from "../../../state/store";

const notificationIconMap: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_BOOKED]: "🗓️",
  [NotificationType.APPOINTMENT_CANCELLED]: "❌",
  [NotificationType.APPOINTMENT_REMINDER]: "⏰",
  [NotificationType.CONSULTATION_JOINED]: "🩺",
  [NotificationType.CONSULTATION_REPORTS_ADDED]: "📄",
  [NotificationType.PASSWORD_CHANGED]: "🔐",
};

const notificationColorMap: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_BOOKED]: "bg-emerald-100 text-emerald-700",
  [NotificationType.APPOINTMENT_CANCELLED]: "bg-red-100 text-red-600",
  [NotificationType.APPOINTMENT_REMINDER]: "bg-amber-100 text-amber-700",
  [NotificationType.CONSULTATION_JOINED]: "bg-blue-100 text-blue-700",
  [NotificationType.CONSULTATION_REPORTS_ADDED]:
    "bg-purple-100 text-purple-700",
  [NotificationType.PASSWORD_CHANGED]: "bg-gray-100 text-gray-700",
};

interface NotificationDropdownProps {
  triggerElement?: React.ReactNode;
  placement?: "bottom-right" | "bottom-left";
}

export function NotificationDropdown({
  triggerElement,
  placement = "bottom-right",
}: NotificationDropdownProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCount, notifications, isDropdownOpen } = useSelector(
    (state: RootState) => state.notification,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userId = useSelector((state: RootState) => state.userInfo.id);

  // Fetch initial unread count
  useEffect(() => {
    if (userId) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, userId]);

  // Socket listener for real-time notifications
  useEffect(() => {
    if (!userId) return;

    const socket = socketService.connect();
    socket.emit("join-room", userId);

    const handleNewNotification = (notification: INotification) => {
      dispatch(addNotification(notification));
      setNewCount((prev) => prev + 1);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [dispatch, userId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dispatch(closeDropdown());
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, dispatch]);

  const loadNotifications = useCallback(
    async (pageNum: number, reset = false) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const data = await getNotifications(pageNum, 10);
        const incoming = data.notifications;
        if (reset) {
          dispatch(setNotifications(incoming));
        } else {
          dispatch(setNotifications([...notifications, ...incoming]));
        }
        setHasMore(pageNum < data.totalPages);
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, isLoading],
  );

  const handleToggle = () => {
    if (!isDropdownOpen) {
      setPage(1);
      setNewCount(0);
      loadNotifications(1, true);
    }
    dispatch(toggleDropdown());
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="notification-bell-btn"
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        {triggerElement ?? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-gray-600 dark:text-slate-400"
          >
            <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
            <path
              fillRule="evenodd"
              d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0L14.25 18a2.25 2.25 0 0 1-4.5 0Z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            id="notification-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute ${placement === "bottom-right" ? "right-0" : "left-0"} top-12 w-[380px] max-w-[calc(100vw-32px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 z-[200] overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  Notifications
                </h3>
                {newCount > 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {newCount} new since you last checked
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-[420px] custom-scrollbar">
              {notifications.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                    🔔
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    No notifications yet
                  </p>
                </div>
              )}

              {notifications.map((notification, idx) => (
                <NotificationItem
                  key={notification.id ?? idx}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}

              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {hasMore && !isLoading && notifications.length > 0 && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-t border-gray-100 dark:border-slate-800"
                >
                  Load more notifications
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: INotification;
  onMarkAsRead: (e: React.MouseEvent, id: string) => void;
}) {
  const icon = notificationIconMap[notification.type] ?? "🔔";
  const colorClass =
    notificationColorMap[notification.type] ?? "bg-gray-100 text-gray-700";
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors cursor-default border-b border-gray-50 dark:border-slate-800/50 last:border-none ${!notification.isRead ? "bg-emerald-50/40 dark:bg-emerald-900/5" : ""}`}
    >
      {/* Icon pill */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base font-medium ${colorClass}`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
          {timeAgo}
        </p>
      </div>

      {/* Unread dot / mark read */}
      <div className="flex-shrink-0 flex items-center">
        {!notification.isRead ? (
          <button
            id={`mark-read-${notification.id}`}
            onClick={(e) => onMarkAsRead(e, notification.id)}
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors focus:outline-none flex-shrink-0"
            title="Mark as read"
          />
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
        )}
      </div>
    </motion.div>
  );
}

export default NotificationDropdown;
