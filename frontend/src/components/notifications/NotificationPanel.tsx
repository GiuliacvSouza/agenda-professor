import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Bell, Calendar, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";

interface Notification {
  _id: string;
  type: "booking_confirmed" | "booking_cancelled" | "booking_request" | "reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Agora';
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "booking_confirmed":
        return <CheckCircle className="size-5 text-green-600" />;
      case "booking_cancelled":
        return <XCircle className="size-5 text-red-600" />;
      case "booking_request":
        return <Calendar className="size-5 text-blue-600" />;
      case "reminder":
        return <Clock className="size-5 text-orange-600" />;
    }
  };

  const getColor = (type: Notification["type"]) => {
    switch (type) {
      case "booking_confirmed":
        return "bg-green-50 border-green-200";
      case "booking_cancelled":
        return "bg-red-50 border-red-200";
      case "booking_request":
        return "bg-blue-50 border-blue-200";
      case "reminder":
        return "bg-orange-50 border-orange-200";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="size-5" />
            Notificações
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0 ? (
              <span>Tem {unreadCount} notificações não lidas</span>
            ) : (
              <span>Não tem notificações não lidas</span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="w-full"
            >
              Marcar todas como lidas
            </Button>
          )}

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3 pr-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Card
                    key={notification._id}
                    className={`${getColor(notification.type)} ${
                      !notification.read ? "border-2" : "opacity-60"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="mt-1">{getIcon(notification.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1"
                                onClick={() => onMarkAsRead(notification._id)}
                              >
                                <X className="size-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 pt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="size-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Sem notificações</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Quando tiver notificações, elas aparecerão aqui
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
