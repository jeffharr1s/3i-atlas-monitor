import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, Check, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: number;
  title: string;
  message?: string;
  type: string;
  category?: string;
  severity?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  actionUrl?: string;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-600" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  error: <AlertCircle className="h-4 w-4 text-red-600" />,
  article_new: <Info className="h-4 w-4 text-blue-600" />,
  alert_triggered: <AlertCircle className="h-4 w-4 text-orange-600" />,
  contradiction_found: <AlertTriangle className="h-4 w-4 text-red-600" />,
  source_update: <CheckCircle2 className="h-4 w-4 text-green-600" />,
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-blue-50 border-blue-200',
  medium: 'bg-yellow-50 border-yellow-200',
  high: 'bg-orange-50 border-orange-200',
  critical: 'bg-red-50 border-red-200',
};

function NotificationItem({ notification, onRead, onDismiss }: {
  notification: Notification;
  onRead: (id: number) => void;
  onDismiss: (id: number) => void;
}) {
  return (
    <div className={`p-3 border rounded-lg ${SEVERITY_COLORS[notification.severity || 'medium']} flex gap-3 items-start`}>
      <div className="flex-shrink-0 mt-0.5">
        {NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.info}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {notification.message && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
            )}
          </div>
          {!notification.isRead && (
            <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          {notification.category && (
            <Badge variant="outline" className="text-xs">
              {notification.category}
            </Badge>
          )}
          <span className="text-xs text-gray-500">
            {new Date(notification.createdAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          {!notification.isRead && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => onRead(notification.id)}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark Read
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
            onClick={() => onDismiss(notification.id)}
          >
            <X className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationsQuery = trpc.notifications.list.useQuery(
    { limit: 20, unreadOnly: false },
    { enabled: isOpen }
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const dismissMutation = trpc.notifications.dismiss.useMutation();

  useEffect(() => {
    if (notificationsQuery.data) {
      const unread = (notificationsQuery.data as any[]).filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notificationsQuery.data]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId: id });
      notificationsQuery.refetch();
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDismiss = async (id: number) => {
    try {
      await dismissMutation.mutateAsync({ notificationId: id });
      notificationsQuery.refetch();
      toast.success('Notification dismissed');
    } catch (error) {
      toast.error('Failed to dismiss notification');
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {notificationsQuery.isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading notifications...</div>
            ) : notificationsQuery.data && (notificationsQuery.data as any[]).length > 0 ? (
              <ScrollArea className="h-96">
                <div className="space-y-2 pr-4">
                  {(notificationsQuery.data as any[]).map((notification: Notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={handleMarkAsRead}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-gray-500">No notifications</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NotificationCenter;
