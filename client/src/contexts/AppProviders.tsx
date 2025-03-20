import React from 'react';
import { MediaProvider, useMedia, useMediaOperations } from './MediaContext';
import { NoteProvider, useNotes, useNoteOperations } from './NoteContext';
import { NotificationProvider, useNotifications } from './NotificationContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NotificationProvider>
      <MediaProvider>
        <NoteProvider>
          {children}
        </NoteProvider>
      </MediaProvider>
    </NotificationProvider>
  );
}

// Export a combined hook for accessing all contexts
export function useAppState() {
  const { state: mediaState } = useMedia();
  const { state: noteState } = useNotes();
  const mediaOps = useMediaOperations();
  const noteOps = useNoteOperations();
  const notifications = useNotifications();

  return {
    state: {
      media: mediaState,
      notes: noteState,
      notifications: {
        list: notifications.notifications,
        unreadCount: notifications.unreadCount,
      },
    },
    operations: {
      media: mediaOps,
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