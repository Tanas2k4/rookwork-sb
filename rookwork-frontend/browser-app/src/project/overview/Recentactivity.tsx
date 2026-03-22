import { MOCK_USERS } from "../../mocks/board";
import { ACTIVITIES } from "../../mocks/overview";

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <div className="flex flex-col divide-y divide-gray-50">
        {ACTIVITIES.map((a) => {
          const user = MOCK_USERS.find((u) => u.id === a.userId);
          return (
            <div key={a.id} className="flex gap-3 py-2.5">
              {user ? (
                <img src={user.avt} alt={user.display_name} className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white" />
              ) : (
                <div className="w-7 h-7 bg-gray-200 rounded-full shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-gray-600 leading-snug">
                  <span className="font-semibold text-gray-800">{user?.display_name}</span>{" "}
                  {a.action}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}