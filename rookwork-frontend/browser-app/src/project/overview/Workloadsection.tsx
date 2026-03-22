import { MOCK_USERS } from "../../mocks/board";
import { workloadMap, maxWorkload } from "../../mocks/overview";

export default function WorkloadSection({ animated }: { animated: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm col-span-2">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Assignment & Workload</h2>
      <div className="flex flex-col divide-y divide-gray-50">
        {MOCK_USERS.map((u) => {
          const count = workloadMap[u.id] || 0;
          const pct = Math.round((count / maxWorkload) * 100);
          const barCls = pct > 80 ? "bg-red-600" : pct > 60 ? "bg-orange-600" : "bg-green-600";
          const pctCls = pct > 80 ? "text-red-600" : pct > 60 ? "text-orange-600" : "text-green-600";
          return (
            <div key={u.id} className="flex items-center gap-3 py-2.5">
              <img src={u.avt} alt={u.display_name} className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800">{u.display_name}</p>
                <p className="text-[11px] text-gray-400">{u.email}</p>
              </div>
              <div className="w-36">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${barCls} transition-all duration-700 ease-out`}
                    style={{ width: animated ? `${pct}%` : "0%" }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-500">{count} tasks</span>
                  <span className={`text-[10px] font-semibold ${pctCls}`}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}