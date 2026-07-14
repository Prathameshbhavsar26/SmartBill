import { useMemo, useState } from "react";
import { Building2, Download, Filter, Search } from "lucide-react";

// Reuse the exact same UI primitives & mock data as App.jsx.
// They remain in App.jsx; we pass the data & helpers in.

export default function BusinessManagement({
  businesses,
  fmt,
  statusBadge,
  Btn,
  Card,
  EmptyState,
  Input,
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return (businesses || []).filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.owner.toLowerCase().includes(search.toLowerCase()) ||
        b.plan.toLowerCase().includes(search.toLowerCase()) ||
        String(b.status).toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, businesses]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search businesses..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Btn
            variant="outline"
            size="md"
            icon={<Filter className="w-4 h-4" />}
          >
            Filter
          </Btn>
          <Btn
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Btn>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">
            Business Management
          </h3>
          <div className="flex gap-2">
            <Btn
              variant="outline"
              size="sm"
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              Filter
            </Btn>
            <Btn
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Btn>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Business",
                  "Owner",
                  "Plan",
                  "Users",
                  "Revenue",
                  "Status",
                  "Joined",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      icon={<Building2 className="w-6 h-6" />}
                      title="No businesses found"
                      sub="Try adjusting your search query"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {b.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{b.owner}</td>
                    <td className="px-5 py-3.5">{statusBadge(b.plan)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{b.users}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {fmt(b.revenue)}
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(b.status)}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
                      {b.joined}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {filtered.length} of {businesses.length} businesses
          </p>
        </div>
      </Card>
    </div>
  );
}


