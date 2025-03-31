import React from 'react';
import { ResourceProvider, useResource, useResourceOperations } from './ResourceContext';
import { NoteProvider, useNotes, useNoteOperations } from './NoteContext';
import { NotificationProvider, useNotifications } from './NotificationContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NotificationProvider>
      <ResourceProvider>
        <NoteProvider>
          {children}
        </NoteProvider>
      </ResourceProvider>
    </NotificationProvider>
  );
}

// Export a combined hook for accessing all contexts
export function useAppState() {
  const { state: resourceState } = useResource();
  const { state: noteState } = useNotes();
  const resourceOps = useResourceOperations();
  const noteOps = useNoteOperations();
  const notifications = useNotifications();

  return {
    state: {
      resource: resourceState,
      notes: noteState,
      notifications: {
        list: notifications.notifications,
        unreadCount: notifications.unreadCount,
      },
    },
    operations: {
      resource: resourceOps,
      notes: noteOps,
      notifications: {
        add: notifications.addNotification,
        markAsRead: notifications.markAsRead,
        markAllAsRead: notifications.markAllAsRead,
        remove: notifications.removeNotification,
        clearAll: notifications.clearAll,
      },
    }
  };
}