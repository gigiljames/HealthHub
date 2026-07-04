import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notification/notificationApi";
import type { INotification } from "../../types/notification";

interface NotificationState {
  unreadCount: number;
  notifications: INotification[];
  isDropdownOpen: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: NotificationState = {
  unreadCount: 0,
  notifications: [],
  isDropdownOpen: false,
  status: "idle",
};

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async () => {
    return await getUnreadNotificationCount();
  },
);

export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id: string) => {
    return await markNotificationAsRead(id);
  },
);

export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async () => {
    await markAllNotificationsAsRead();
  },
);

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<INotification>) => {
      const existingIndex = state.notifications.findIndex(
        (n) => n.id === action.payload.id || (n.referenceId === action.payload.referenceId && n.type === action.payload.type)
      );
      if (existingIndex !== -1) {
        const wasRead = state.notifications[existingIndex].isRead;
        state.notifications[existingIndex] = action.payload;
        if (wasRead && !action.payload.isRead) {
          state.unreadCount += 1;
        }
      } else {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    deleteNotificationByReference: (state, action: PayloadAction<{ referenceId: string; type: string }>) => {
      const index = state.notifications.findIndex(
        (n) => n.referenceId === action.payload.referenceId && n.type === action.payload.type
      );
      if (index !== -1) {
        const wasRead = state.notifications[index].isRead;
        state.notifications.splice(index, 1);
        if (!wasRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    setNotifications: (state, action: PayloadAction<INotification[]>) => {
      state.notifications = action.payload;
    },
    toggleDropdown: (state) => {
      state.isDropdownOpen = !state.isDropdownOpen;
    },
    closeDropdown: (state) => {
      state.isDropdownOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (n) => n.id === action.payload.id,
        );
        if (index !== -1 && !state.notifications[index].isRead) {
          state.notifications[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const {
  addNotification,
  deleteNotificationByReference,
  setNotifications,
  toggleDropdown,
  closeDropdown,
} = notificationSlice.actions;

export default notificationSlice.reducer;
