import { useState } from "react";
import { Building2, Download, Eye, Filter, Plus, Search } from "lucide-react";
import { businesses } from "../../data/mockData";
import { fmt, fmtK } from "../../utils/format";
import { Btn, Card, statusBadge } from "../../components/common/ui";

export default function BusinessesScreen({ onOpenBusiness }) {
  // Business-owner should never land here on refresh.
  // Kept only for legacy compatibility routes.

  const [search, setSearch] = useState("");

  const filtered = businesses.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(b.name ?? "")
        .toLowerCase()
        .includes(q) ||
      String(b.owner ?? "")
        .toLowerCase()
        .includes(q) ||
      String(b.plan ?? "")
        .toLowerCase()
        .includes(q) ||
      String(b.status ?? "")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            value={search}
            onChange={setSearch}
            placeholder="Search business, owner, plan..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900">
            {filtered.length}
          </span>
          <span>results</span>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {[
                  "Business Name",
                  "Business Owner",
                  "Email",
                  "Phone Number",
                  "City",
                  "Subscription Plan",
                  "Joining Date",
                  "Revenue",
                  "Employees",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10"></td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{b.name}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{b.owner}</td>
                    <td className="px-5 py-4 text-slate-600">{b.ownerEmail}</td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                      {b.ownerPhone}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{b.ownerCity}</td>
                    <td className="px-5 py-4">
                      <Badge label={b.plan} variant="blue" />
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap align-top">
                      <div className="w-fit whitespace-nowrap">{b.joined}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {fmt(b.revenue)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{b.users}</td>
                    <td className="px-5 py-4">{statusBadge(b.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Btn variant="ghost" size="sm" onClick={() => {}}>
                          View
                        </Btn>
                      </div>
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
