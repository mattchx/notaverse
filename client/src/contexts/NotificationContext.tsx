import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'read' | 'timestamp'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: crypto.randomUUID(),
        read: false,
        timestamp: new Date(),
      };
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }

    case 'MARK_AS_READ': {
      return {
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }

    case 'MARK_ALL_AS_READ': {
      return {
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      };
    }

    case 'REMOVE_NOTIFICATION': {
      const removedNotification = state.notifications.find(
        (n) => n.id === action.payload
      );
      return {
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
        unreadCount: removedNotification?.read
          ? state.unreadCount
          : Math.max(0, state.unreadCount - 1),
      };
    }

    case 'CLEAR_ALL': {
      return initialState;
    }

    default:
      return state;
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}