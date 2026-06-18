import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import type { AppDispatch, RootState } from "../../../state/store";
import { Check } from "lucide-react";
import {
  addNotification,
  fetchUnreadCount,
  markAllAsRead,
  markAsRead,
  setNotifications,
} from "../../../state/notification/notificationSlice";
import { getNotifications } from "../../../api/notification/notificationApi";
import { socketService } from "../../../api/socketService";
import {
  NotificationType,
  type INotification,
} from "../../../types/notification";

const notificationIconMap: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_BOOKED]: "🗓️",
  [NotificationType.APPOINTMENT_CANCELLED]: "❌",
  [NotificationType.APPOINTMENT_REMINDER]: "⏰",
  [NotificationType.CONSULTATION_JOINED]: "🩺",
  [NotificationType.CONSULTATION_REPORTS_ADDED]: "📄",
  [NotificationType.PASSWORD_CHANGED]: "🔐",
  [NotificationType.SYSTEM]: "🔔",
};

const notificationColorMap: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_BOOKED]: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  [NotificationType.APPOINTMENT_CANCELLED]: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  [NotificationType.APPOINTMENT_REMINDER]: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [NotificationType.CONSULTATION_JOINED]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  [NotificationType.CONSULTATION_REPORTS_ADDED]: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  [NotificationType.PASSWORD_CHANGED]: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  [NotificationType.SYSTEM]: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

interface DNotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DNotificationSidebar({ isOpen, onClose }: DNotificationSidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCount, notifications } = useSelector(
    (state: RootState) => state.notification,
  );
  const userId = useSelector((state: RootState) => state.userInfo.id);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [newCount, setNewCount] = useState(0);

  // Fetch unread count on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, userId]);

  // Socket listener
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

  const loadNotifications = useCallback(
    async (pageNum: number, reset = false) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const data = await getNotifications(pageNum, 15);
        if (reset) {
          dispatch(setNotifications(data.notifications));
        } else {
          dispatch(setNotifications([...notifications, ...data.notifications]));
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

  // Load when panel opens
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setNewCount(0);
      loadNotifications(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[65] bg-black/20 dark:bg-black/40 backdrop-blur-[1px] lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="fixed right-0 top-0 h-screen w-[380px] max-w-[100vw] z-[70] flex flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {newCount > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    {newCount} new since you last checked
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    id="doctor-mark-all-read-btn"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Summary Badges */}
            {/* <div className="flex gap-3 px-5 py-3 border-b border-gray-50 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  {unreadNotifications.length} Unread
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
                <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                  {readNotifications.length} Read
                </span>
              </div>
            </div> */}

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-3xl">
                    🔔
                  </div>
                  <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
                    No notifications yet
                  </p>
                </div>
              )}

              {/* ─── Unread Section ─── */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="sticky top-0 z-10 flex items-center gap-2 px-5 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-50 dark:border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                      Unread · {unreadNotifications.length}
                    </span>
                  </div>
                  {unreadNotifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onMarkRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )}

              {/* ─── Vertical Divider ─── */}
              {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Earlier</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                </div>
              )}

              {/* ─── Read Section ─── */}
              {readNotifications.length > 0 && (
                <div>
                  {unreadNotifications.length === 0 && (
                    <div className="sticky top-0 z-10 flex items-center gap-2 px-5 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-50 dark:border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                        Read · {readNotifications.length}
                      </span>
                    </div>
                  )}
                  {readNotifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onMarkRead={handleMarkAsRead}
                      dimmed
                    />
                  ))}
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Load More */}
              {hasMore && !isLoading && notifications.length > 0 && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors border-t border-gray-100 dark:border-slate-800"
                >
                  Load more
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
  dimmed = false,
}: {
  notification: INotification;
  onMarkRead: (id: string) => void;
  dimmed?: boolean;
}) {
  const icon = notificationIconMap[notification.type] ?? "🔔";
  const colorClass = notificationColorMap[notification.type] ?? "bg-gray-100 text-gray-700";
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 dark:border-slate-800/50 last:border-none transition-colors ${!notification.isRead
        ? "bg-emerald-50/50 dark:bg-emerald-900/5 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
        : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
        } ${dimmed ? "opacity-70" : ""}`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium ${colorClass}`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title and TimeAgo side-by-side */}
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug ${notification.isRead ? "text-gray-600 dark:text-slate-400" : "text-gray-900 dark:text-white"}`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0">
            {!notification.isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            )}
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {notification.message}
        </p>

        {/* Mark read button aligned to bottom right */}
        <div className="mt-3 flex justify-end">
          {!notification.isRead ? (
            <button
              id={`doctor-mark-read-${notification.id}`}
              onClick={() => onMarkRead(notification.id)}
              title="Mark as read"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-250/20 dark:border-emerald-800/30 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark as read</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800/30 border border-gray-200/20 dark:border-slate-800/20 rounded-xl select-none opacity-60">
              <Check className="w-3.5 h-3.5" />
              <span>Read</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DNotificationSidebar;
