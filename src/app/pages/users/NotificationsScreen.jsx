import { Bell, CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { notifications } from "../../data/mockData";
import { Card, Btn } from "../../components/common/ui";

export default function NotificationsScreen() {
  const typeIcon = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
  };
  const typeBg = {
    warning: "bg-amber-50 border-amber-200",
    error: "bg-red-50 border-red-200",
    success: "bg-emerald-50 border-emerald-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-500">
          {notifications.filter((n) => !n.read).length} unread notifications
        </p>
        <Btn variant="ghost" size="sm">
          Mark all as read
        </Btn>
      </div>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${n.read ? "bg-white border-slate-200 opacity-70" : typeBg[n.type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">{typeIcon[n.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {n.time}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
          </div>
          {!n.read && (
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
