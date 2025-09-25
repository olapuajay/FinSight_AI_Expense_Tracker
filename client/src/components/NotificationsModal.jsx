import { useDispatch, useSelector } from "react-redux";
import { markNotificationRead, clearNotifications } from "../redux/slices/notificationSlice";
import { X } from "lucide-react";

export default function NotificationsModal({ onClose }) {
  const { list } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end">
      <div className="w-96 bg-white h-full shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="flex items-center gap-2">
            <button
              className="text-sm text-blue-600"
              onClick={() => dispatch(clearNotifications(list[0]?.userId))}
            >
              Clear All
            </button>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No notifications</p>
          ) : (
            list.map((n) => (
              <div
                key={n._id}
                onClick={() => dispatch(markNotificationRead(n._id))}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  n.isRead ? "bg-white" : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{n.message}</p>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
