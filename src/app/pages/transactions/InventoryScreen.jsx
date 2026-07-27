import { useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  Download,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { products } from "../../data/mockData";
import { fmt } from "../../utils/format";
import {
  Badge,
  Btn,
  Card,
  StatCard,
  statusBadge,
} from "../../components/common/ui";

export default function InventoryScreen() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value="231"
          sub="Across 4 categories"
          trend="neutral"
          icon={<Package className="w-5 h-5" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Total Stock Value"
          value="₹24.8L"
          sub="+6.2% this month"
          trend="up"
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Low Stock Items"
          value="3"
          sub="Action required"
          trend="down"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Out of Stock"
          value="1"
          sub="Reorder pending"
          trend="down"
          icon={<XCircle className="w-5 h-5" />}
          color="bg-red-50 text-red-500"
        />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-1">Low Stock Alerts</h3>
        <p className="text-xs text-slate-500 mb-4">
          Items that need immediate reordering
        </p>
        <div className="space-y-3">
          {products
            .filter((p) => p.stock <= p.minStock)
            .map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${p.stock === 0 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
              >
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 ${p.stock === 0 ? "text-red-500" : "text-amber-500"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${p.stock === 0 ? "text-red-500" : "text-amber-600"}`}
                  >
                    {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                  </p>
                  <p className="text-xs text-slate-500">Min: {p.minStock}</p>
                </div>
                <Btn
                  variant={p.stock === 0 ? "danger" : "outline"}
                  size="sm"
                  icon={<ShoppingCart className="w-3.5 h-3.5" />}
                >
                  Reorder
                </Btn>
              </div>
            ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Current Stock</h3>
          <div className="flex gap-2">
            <Btn
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Adjust Stock
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {[
                "Product",
                "Category",
                "In Stock",
                "Min Level",
                "Value",
                "Status",
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
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge label={p.category} variant="blue" />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold font-mono ${p.stock === 0 ? "text-red-500" : p.stock <= p.minStock ? "text-amber-600" : "text-slate-900"}`}
                    >
                      {p.stock}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (p.stock / 50) * 100)}%`,
                          backgroundColor:
                            p.stock === 0
                              ? "#EF4444"
                              : p.stock <= p.minStock
                                ? "#F59E0B"
                                : "#10B981",
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-600 font-mono">
                  {p.minStock}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-900">
                  {fmt(p.price * p.stock)}
                </td>
                <td className="px-5 py-3.5">
                  {statusBadge(p.stock === 0 ? "Inactive" : p.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
