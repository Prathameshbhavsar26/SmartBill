import { useState } from "react";
import {
  BarChart3,
  Download,
  Package,
  Percent,
  Printer,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import PurchaseReport from "./PurchaseReport";
import ProfitLossReport from "./ProfitLossReport";
import GSTReport from "./GSTReport";
import InventoryReport from "./InventoryReport";
import SalesReport from "./SalesReport";
import { Btn } from "../../components/common/ui";

export default function ReportsScreen() {
  const [activeReport, setActiveReport] = useState("sales");
  const reportTypes = [
    { key: "sales", label: "Sales Report", icon: TrendingUp },
    { key: "purchase", label: "Purchase Report", icon: ShoppingCart },
    { key: "pl", label: "Profit & Loss", icon: BarChart3 },
    { key: "gst", label: "GST Report", icon: Percent },
    { key: "inventory", label: "Inventory Report", icon: Package },
  ];

  const handleExport = () => {
    window.print();
  };

  const renderActiveReport = () => {
    switch (activeReport) {
      case "sales":
        return <SalesReport />;
      case "purchase":
        return <PurchaseReport />;
      case "pl":
        return <ProfitLossReport />;
      case "gst":
        return <GSTReport />;
      case "inventory":
        return <InventoryReport />;
      default:
        return <SalesReport />;
    }
  };

  return (
    <div className="space-y-5 print:p-0">
      <div className="flex gap-2 flex-wrap print:hidden">
        {reportTypes.map((r) => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeReport === r.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            <r.icon className="w-4 h-4" />
            {r.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Btn
            variant="outline"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export Excel
          </Btn>
          <Btn
            variant="outline"
            size="md"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Print PDF
          </Btn>
        </div>
      </div>

      {renderActiveReport()}
    </div>
  );
}
