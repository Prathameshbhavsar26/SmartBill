/**
 * reportExporter.js
 * Utility to export SmartBill reports to Excel (CSV/XLS) and trigger print-ready PDF views.
 */

function downloadFile(content, fileName, mimeType = "text/csv;charset=utf-8;") {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function getBusinessInfo() {
  try {
    const raw = localStorage.getItem("smartbill_user");
    if (raw) {
      const u = JSON.parse(raw);
      return {
        name: u.businessName || u.companyName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "SmartBill Business",
        gstin: u.gstin || u.gstNumber || "",
        phone: u.phone || u.phoneNumber || "",
        email: u.email || "",
        address: u.address || "",
      };
    }
  } catch {
    // fallback
  }
  return {
    name: "SmartBill Business",
    gstin: "",
    phone: "",
    email: "",
    address: "",
  };
}

/**
 * 1. EXPORT TO EXCEL (CSV format with UTF-8 BOM)
 */
export function exportReportToExcel(reportKey, data, dateRange = {}) {
  const biz = getBusinessInfo();
  const dateStr = new Date().toISOString().slice(0, 10);
  const from = dateRange.from || "All Time";
  const to = dateRange.to || dateStr;

  let rows = [];
  let fileName = `SmartBill_${reportKey}_report_${dateStr}.csv`;

  // Header Rows
  rows.push([escapeCsv(biz.name)]);
  if (biz.gstin) rows.push([escapeCsv(`GSTIN: ${biz.gstin}`)]);
  rows.push([escapeCsv(`Report: ${reportKey.toUpperCase()} REPORT`), escapeCsv(`Period: ${from} to ${to}`)]);
  rows.push([escapeCsv(`Generated: ${new Date().toLocaleString("en-IN")}`)]);
  rows.push([]); // empty line

  if (reportKey === "sales") {
    const orders = data.filteredOrders || [];
    const totalRev = orders.reduce((s, o) => s + (Number(o.totalOrderValue || o.total) || 0), 0);
    const totalPaid = orders.reduce((s, o) => s + (Number(o.amountPaid || o.totalOrderValue) || 0), 0);

    rows.push([escapeCsv("SUMMARY METRICS")]);
    rows.push([escapeCsv("Total Invoices"), escapeCsv(orders.length)]);
    rows.push([escapeCsv("Total Revenue (INR)"), escapeCsv(totalRev.toFixed(2))]);
    rows.push([escapeCsv("Total Collected (INR)"), escapeCsv(totalPaid.toFixed(2))]);
    rows.push([]);

    rows.push([
      escapeCsv("Date"),
      escapeCsv("Invoice No"),
      escapeCsv("Customer Name"),
      escapeCsv("Items Count"),
      escapeCsv("Payment Mode"),
      escapeCsv("Invoice Amount (INR)"),
      escapeCsv("Amount Paid (INR)"),
      escapeCsv("Balance Due (INR)"),
    ]);

    orders.forEach((o) => {
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : o.date || "-";
      const total = Number(o.totalOrderValue || o.total || 0);
      const paid = Number(o.amountPaid !== undefined ? o.amountPaid : total);
      const due = Math.max(0, total - paid);
      const itemsCount = Array.isArray(o.items) ? o.items.length : 1;

      rows.push([
        escapeCsv(d),
        escapeCsv(o.invoiceNo || o._id || "-"),
        escapeCsv(o.customerName || "Walk-in Customer"),
        escapeCsv(itemsCount),
        escapeCsv(o.paymentMode || "Cash"),
        escapeCsv(total.toFixed(2)),
        escapeCsv(paid.toFixed(2)),
        escapeCsv(due.toFixed(2)),
      ]);
    });
  } else if (reportKey === "purchase") {
    const purchases = data.filteredPurchases || [];
    const totalPurch = purchases.reduce((s, p) => s + (Number(p.totalAmount || p.total) || 0), 0);
    const totalPaid = purchases.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
    const totalDue = purchases.reduce((s, p) => s + (Number(p.remainingAmount) || 0), 0);

    rows.push([escapeCsv("SUMMARY METRICS")]);
    rows.push([escapeCsv("Total Purchases"), escapeCsv(purchases.length)]);
    rows.push([escapeCsv("Total Purchase Amount (INR)"), escapeCsv(totalPurch.toFixed(2))]);
    rows.push([escapeCsv("Total Paid (INR)"), escapeCsv(totalPaid.toFixed(2))]);
    rows.push([escapeCsv("Total Due (INR)"), escapeCsv(totalDue.toFixed(2))]);
    rows.push([]);

    rows.push([
      escapeCsv("Date"),
      escapeCsv("Supplier Name"),
      escapeCsv("Invoice / PO No"),
      escapeCsv("Items Count"),
      escapeCsv("Subtotal (INR)"),
      escapeCsv("GST (INR)"),
      escapeCsv("Total Amount (INR)"),
      escapeCsv("Status"),
      escapeCsv("Remaining Due (INR)"),
    ]);

    purchases.forEach((p) => {
      const d = p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString("en-IN") : p.date || "-";
      rows.push([
        escapeCsv(d),
        escapeCsv(p.supplierName || p.supplier || "Supplier"),
        escapeCsv(p.supplierInvoiceNo || p.invoiceNo || "-"),
        escapeCsv(Array.isArray(p.items) ? p.items.length : p.items || 0),
        escapeCsv((Number(p.subtotal) || 0).toFixed(2)),
        escapeCsv((Number(p.gstTotal || p.gst) || 0).toFixed(2)),
        escapeCsv((Number(p.totalAmount || p.total) || 0).toFixed(2)),
        escapeCsv(p.paymentStatus || "Unpaid"),
        escapeCsv((Number(p.remainingAmount) || 0).toFixed(2)),
      ]);
    });
  } else if (reportKey === "inventory") {
    const products = data.products || [];
    const totalVal = products.reduce((s, p) => s + (Number(p.stock || 0) * Number(p.cost || p.price || 0)), 0);

    rows.push([escapeCsv("SUMMARY METRICS")]);
    rows.push([escapeCsv("Total Products"), escapeCsv(products.length)]);
    rows.push([escapeCsv("Total Inventory Valuation (INR)"), escapeCsv(totalVal.toFixed(2))]);
    rows.push([]);

    rows.push([
      escapeCsv("Product Name"),
      escapeCsv("Category"),
      escapeCsv("Current Stock"),
      escapeCsv("Unit"),
      escapeCsv("Min Stock Level"),
      escapeCsv("Cost / Purchase Price (INR)"),
      escapeCsv("Selling Price (INR)"),
      escapeCsv("Total Stock Value (INR)"),
      escapeCsv("Stock Status"),
    ]);

    products.forEach((p) => {
      const stock = Number(p.stock) || 0;
      const min = Number(p.minStock ?? 10);
      const cost = Number(p.cost || p.price || 0);
      const price = Number(p.price || 0);
      const val = stock * cost;
      const status = stock <= 0 ? "Out of Stock" : stock <= min ? "Low Stock" : "In Stock";

      rows.push([
        escapeCsv(p.name || "-"),
        escapeCsv(p.category || "General"),
        escapeCsv(stock),
        escapeCsv(p.unit || "pcs"),
        escapeCsv(min),
        escapeCsv(cost.toFixed(2)),
        escapeCsv(price.toFixed(2)),
        escapeCsv(val.toFixed(2)),
        escapeCsv(status),
      ]);
    });
  } else if (reportKey === "pl") {
    const orders = data.filteredOrders || [];
    const expenses = data.filteredExpenses || [];
    const revenue = orders.reduce((s, o) => s + (Number(o.totalOrderValue || o.total) || 0), 0);
    const expTotal = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const profit = revenue - expTotal;

    rows.push([escapeCsv("PROFIT & LOSS STATEMENT")]);
    rows.push([escapeCsv("Total Sales Revenue (INR)"), escapeCsv(revenue.toFixed(2))]);
    rows.push([escapeCsv("Total Operating Expenses (INR)"), escapeCsv(expTotal.toFixed(2))]);
    rows.push([escapeCsv("Net Profit / Loss (INR)"), escapeCsv(profit.toFixed(2))]);
    rows.push([escapeCsv("Profit Margin (%)"), escapeCsv(revenue > 0 ? ((profit / revenue) * 100).toFixed(2) + "%" : "0%")]);
    rows.push([]);

    rows.push([escapeCsv("EXPENSE BREAKDOWN BY CATEGORY")]);
    rows.push([escapeCsv("Expense Category"), escapeCsv("Total Amount (INR)")]);
    const catMap = {};
    expenses.forEach((e) => {
      const cat = e.category || "General";
      catMap[cat] = (catMap[cat] || 0) + (Number(e.amount) || 0);
    });
    Object.entries(catMap).forEach(([cat, amt]) => {
      rows.push([escapeCsv(cat), escapeCsv(amt.toFixed(2))]);
    });
  } else if (reportKey === "gst") {
    const orders = data.filteredOrders || [];
    const totalTaxable = orders.reduce((s, o) => s + (Number(o.subtotal) || 0), 0);
    const totalGst = orders.reduce((s, o) => s + (Number(o.gst) || 0), 0);

    rows.push([escapeCsv("GST TAX SUMMARY (GSTR-1)")]);
    rows.push([escapeCsv("Total Taxable Value (INR)"), escapeCsv(totalTaxable.toFixed(2))]);
    rows.push([escapeCsv("CGST (Central Tax) (INR)"), escapeCsv((totalGst / 2).toFixed(2))]);
    rows.push([escapeCsv("SGST (State Tax) (INR)"), escapeCsv((totalGst / 2).toFixed(2))]);
    rows.push([escapeCsv("Total GST Collected (INR)"), escapeCsv(totalGst.toFixed(2))]);
    rows.push([]);

    rows.push([
      escapeCsv("Date"),
      escapeCsv("Invoice No"),
      escapeCsv("Customer Name"),
      escapeCsv("Customer GSTIN"),
      escapeCsv("Taxable Amount (INR)"),
      escapeCsv("GST Rate"),
      escapeCsv("GST Amount (INR)"),
      escapeCsv("Total Invoice Value (INR)"),
    ]);

    orders.forEach((o) => {
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : o.date || "-";
      rows.push([
        escapeCsv(d),
        escapeCsv(o.invoiceNo || o._id || "-"),
        escapeCsv(o.customerName || "Customer"),
        escapeCsv(o.customerGstin || "Unregistered"),
        escapeCsv((Number(o.subtotal) || 0).toFixed(2)),
        escapeCsv(`${o.gstRate || 18}%`),
        escapeCsv((Number(o.gst) || 0).toFixed(2)),
        escapeCsv((Number(o.totalOrderValue || o.total) || 0).toFixed(2)),
      ]);
    });
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  downloadFile(csvContent, fileName, "text/csv;charset=utf-8;");
}

/**
 * 2. PRINT / EXPORT TO PDF
 * Generates an isolated, beautifully styled printable document and calls browser print dialog.
 */
export function printReportPDF(reportKey, data, dateRange = {}) {
  const biz = getBusinessInfo();
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const from = dateRange.from ? new Date(dateRange.from).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "All Time";
  const to = dateRange.to ? new Date(dateRange.to).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : dateStr;

  const titleMap = {
    sales: "Sales & Invoicing Report",
    purchase: "Purchase & Supplier Report",
    pl: "Profit & Loss Financial Statement",
    gst: "GST Filing & Tax Report",
    inventory: "Inventory Valuation & Stock Report",
  };
  const reportTitle = titleMap[reportKey] || "Business Report";

  let summaryHtml = "";
  let tableHeadersHtml = "";
  let tableRowsHtml = "";

  if (reportKey === "sales") {
    const orders = data.filteredOrders || [];
    const totalRev = orders.reduce((s, o) => s + (Number(o.totalOrderValue || o.total) || 0), 0);
    const totalPaid = orders.reduce((s, o) => s + (Number(o.amountPaid || o.totalOrderValue) || 0), 0);
    const totalDue = Math.max(0, totalRev - totalPaid);

    summaryHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Invoices</div>
          <div class="kpi-val">${orders.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Revenue</div>
          <div class="kpi-val text-blue">₹${totalRev.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Collected</div>
          <div class="kpi-val text-green">₹${totalPaid.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Outstanding Dues</div>
          <div class="kpi-val text-red">₹${totalDue.toLocaleString("en-IN")}</div>
        </div>
      </div>
    `;

    tableHeadersHtml = `
      <th>Date</th>
      <th>Invoice #</th>
      <th>Customer</th>
      <th>Payment Mode</th>
      <th style="text-align: right;">Amount</th>
      <th style="text-align: right;">Paid</th>
      <th style="text-align: right;">Balance</th>
    `;

    tableRowsHtml = orders.map((o) => {
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : o.date || "-";
      const total = Number(o.totalOrderValue || o.total || 0);
      const paid = Number(o.amountPaid !== undefined ? o.amountPaid : total);
      const due = Math.max(0, total - paid);
      return `
        <tr>
          <td>${d}</td>
          <td class="mono">${o.invoiceNo || o._id || "-"}</td>
          <td><b>${o.customerName || "Walk-in Customer"}</b></td>
          <td>${o.paymentMode || "Cash"}</td>
          <td style="text-align: right;" class="mono bold">₹${total.toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="mono text-green">₹${paid.toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="mono ${due > 0 ? "text-red" : "text-slate"}">${due > 0 ? "₹" + due.toLocaleString("en-IN") : "Cleared"}</td>
        </tr>
      `;
    }).join("");
  } else if (reportKey === "purchase") {
    const purchases = data.filteredPurchases || [];
    const totalPurch = purchases.reduce((s, p) => s + (Number(p.totalAmount || p.total) || 0), 0);
    const totalPaid = purchases.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
    const totalDue = purchases.reduce((s, p) => s + (Number(p.remainingAmount) || 0), 0);

    summaryHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Purchases Count</div>
          <div class="kpi-val">${purchases.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Purchases</div>
          <div class="kpi-val text-blue">₹${totalPurch.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Paid to Suppliers</div>
          <div class="kpi-val text-green">₹${totalPaid.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pending Payables</div>
          <div class="kpi-val text-red">₹${totalDue.toLocaleString("en-IN")}</div>
        </div>
      </div>
    `;

    tableHeadersHtml = `
      <th>Date</th>
      <th>Supplier</th>
      <th>Invoice / PO #</th>
      <th>Items</th>
      <th style="text-align: right;">Subtotal</th>
      <th style="text-align: right;">GST</th>
      <th style="text-align: right;">Total</th>
      <th>Status</th>
      <th style="text-align: right;">Remaining</th>
    `;

    tableRowsHtml = purchases.map((p) => {
      const d = p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString("en-IN") : p.date || "-";
      const total = Number(p.totalAmount || p.total || 0);
      const rem = Number(p.remainingAmount || 0);
      return `
        <tr>
          <td>${d}</td>
          <td><b>${p.supplierName || p.supplier || "Supplier"}</b></td>
          <td class="mono">${p.supplierInvoiceNo || p.invoiceNo || "-"}</td>
          <td>${Array.isArray(p.items) ? p.items.length : p.items || 0}</td>
          <td style="text-align: right;" class="mono">₹${(Number(p.subtotal) || 0).toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="mono text-green">+₹${(Number(p.gstTotal || p.gst) || 0).toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="mono bold">₹${total.toLocaleString("en-IN")}</td>
          <td><span class="pill">${p.paymentStatus || "Unpaid"}</span></td>
          <td style="text-align: right;" class="mono ${rem > 0 ? "text-red" : "text-slate"}">${rem > 0 ? "₹" + rem.toLocaleString("en-IN") : "Cleared"}</td>
        </tr>
      `;
    }).join("");
  } else if (reportKey === "inventory") {
    const products = data.products || [];
    const totalVal = products.reduce((s, p) => s + (Number(p.stock || 0) * Number(p.cost || p.price || 0)), 0);
    const lowCount = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock ?? 10)).length;
    const outCount = products.filter((p) => Number(p.stock) <= 0).length;

    summaryHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total SKUs</div>
          <div class="kpi-val">${products.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Inventory Valuation</div>
          <div class="kpi-val text-blue">₹${totalVal.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Low Stock Items</div>
          <div class="kpi-val text-amber">${lowCount}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Out of Stock</div>
          <div class="kpi-val text-red">${outCount}</div>
        </div>
      </div>
    `;

    tableHeadersHtml = `
      <th>Product Name</th>
      <th>Category</th>
      <th style="text-align: center;">Stock</th>
      <th>Unit</th>
      <th style="text-align: right;">Unit Cost</th>
      <th style="text-align: right;">Selling Price</th>
      <th style="text-align: right;">Stock Valuation</th>
      <th>Status</th>
    `;

    tableRowsHtml = products.map((p) => {
      const stock = Number(p.stock) || 0;
      const min = Number(p.minStock ?? 10);
      const cost = Number(p.cost || p.price || 0);
      const val = stock * cost;
      const status = stock <= 0 ? "Out of Stock" : stock <= min ? "Low Stock" : "In Stock";
      return `
        <tr>
          <td><b>${p.name || "-"}</b></td>
          <td>${p.category || "General"}</td>
          <td style="text-align: center;" class="mono bold">${stock}</td>
          <td>${p.unit || "pcs"}</td>
          <td style="text-align: right;" class="mono">₹${cost.toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="mono">₹${(Number(p.price) || 0).toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="mono bold">₹${val.toLocaleString("en-IN")}</td>
          <td><span class="pill ${status === 'In Stock' ? 'pill-green' : status === 'Low Stock' ? 'pill-amber' : 'pill-red'}">${status}</span></td>
        </tr>
      `;
    }).join("");
  } else if (reportKey === "pl") {
    const orders = data.filteredOrders || [];
    const expenses = data.filteredExpenses || [];
    const revenue = orders.reduce((s, o) => s + (Number(o.totalOrderValue || o.total) || 0), 0);
    const expTotal = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const profit = revenue - expTotal;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    summaryHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Sales Revenue</div>
          <div class="kpi-val text-blue">₹${revenue.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Operating Expenses</div>
          <div class="kpi-val text-red">₹${expTotal.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Net Profit / Loss</div>
          <div class="kpi-val ${profit >= 0 ? "text-green" : "text-red"}">₹${profit.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Net Margin</div>
          <div class="kpi-val">${margin}%</div>
        </div>
      </div>
    `;

    tableHeadersHtml = `
      <th>Category</th>
      <th>Description / Notes</th>
      <th>Date</th>
      <th>Payment Mode</th>
      <th style="text-align: right;">Amount (INR)</th>
    `;

    tableRowsHtml = expenses.map((e) => {
      const d = e.date || e.createdAt ? new Date(e.date || e.createdAt).toLocaleDateString("en-IN") : "-";
      return `
        <tr>
          <td><b>${e.category || "General"}</b></td>
          <td>${e.description || e.notes || "-"}</td>
          <td>${d}</td>
          <td>${e.paymentMode || "Cash"}</td>
          <td style="text-align: right;" class="mono bold text-red">₹${(Number(e.amount) || 0).toLocaleString("en-IN")}</td>
        </tr>
      `;
    }).join("");
  } else if (reportKey === "gst") {
    const orders = data.filteredOrders || [];
    const totalTaxable = orders.reduce((s, o) => s + (Number(o.subtotal) || 0), 0);
    const totalGst = orders.reduce((s, o) => s + (Number(o.gst) || 0), 0);

    summaryHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Taxable Turnover</div>
          <div class="kpi-val text-blue">₹${totalTaxable.toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">CGST (Central Tax)</div>
          <div class="kpi-val">₹${(totalGst / 2).toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">SGST (State Tax)</div>
          <div class="kpi-val">₹${(totalGst / 2).toLocaleString("en-IN")}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total GST Output</div>
          <div class="kpi-val text-green">₹${totalGst.toLocaleString("en-IN")}</div>
        </div>
      </div>
    `;

    tableHeadersHtml = `
      <th>Date</th>
      <th>Invoice #</th>
      <th>Customer</th>
      <th>GSTIN</th>
      <th style="text-align: right;">Taxable Amount</th>
      <th style="text-align: center;">Rate</th>
      <th style="text-align: right;">GST Tax</th>
      <th style="text-align: right;">Invoice Total</th>
    `;

    tableRowsHtml = orders.map((o) => {
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : o.date || "-";
      return `
        <tr>
          <td>${d}</td>
          <td class="mono">${o.invoiceNo || o._id || "-"}</td>
          <td><b>${o.customerName || "Customer"}</b></td>
          <td class="mono">${o.customerGstin || "Unregistered"}</td>
          <td style="text-align: right;" class="mono">₹${(Number(o.subtotal) || 0).toLocaleString("en-IN")}</td>
          <td style="text-align: center;" class="mono">${o.gstRate || 18}%</td>
          <td style="text-align: right;" class="mono text-green">₹${(Number(o.gst) || 0).toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="mono bold">₹${(Number(o.totalOrderValue || o.total) || 0).toLocaleString("en-IN")}</td>
        </tr>
      `;
    }).join("");
  }

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle} - ${biz.name}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 11px;
            padding: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .biz-name { font-size: 18px; font-weight: 800; color: #1e3a8a; }
          .biz-sub { font-size: 11px; color: #475569; margin-top: 2px; }
          .report-meta { text-align: right; }
          .report-title { font-size: 16px; font-weight: 800; color: #0f172a; }
          .report-dates { font-size: 11px; color: #64748b; margin-top: 3px; font-weight: 600; }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }
          .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
          }
          .kpi-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          .kpi-val { font-size: 14px; font-weight: 800; margin-top: 3px; font-family: monospace; }
          .text-blue { color: #2563eb; }
          .text-green { color: #16a34a; }
          .text-red { color: #dc2626; }
          .text-amber { color: #d97706; }
          .text-slate { color: #64748b; }
          .mono { font-family: "SFMono-Regular", Consolas, monospace; }
          .bold { font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
          th {
            background: #f1f5f9;
            color: #334155;
            text-align: left;
            padding: 7px 6px;
            border-bottom: 1.5px solid #cbd5e1;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9px;
          }
          td {
            padding: 7px 6px;
            border-bottom: 1px solid #e2e8f0;
            color: #1e293b;
          }
          tr:nth-child(even) td { background: #fafafa; }
          .pill {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 9999px;
            font-size: 9px;
            font-weight: 700;
            background: #f1f5f9;
            color: #475569;
          }
          .pill-green { background: #dcfce7; color: #15803d; }
          .pill-amber { background: #fef9c3; color: #a16207; }
          .pill-red { background: #fee2e2; color: #b91c1c; }
          .footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 9px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="biz-name">${biz.name}</div>
            ${biz.gstin ? `<div class="biz-sub">GSTIN: <b>${biz.gstin}</b></div>` : ""}
            ${biz.phone ? `<div class="biz-sub">Phone: ${biz.phone}</div>` : ""}
            ${biz.email ? `<div class="biz-sub">Email: ${biz.email}</div>` : ""}
          </div>
          <div class="report-meta">
            <div class="report-title">${reportTitle}</div>
            <div class="report-dates">Period: ${from} — ${to}</div>
            <div class="biz-sub">Printed on: ${dateStr}</div>
          </div>
        </div>

        ${summaryHtml}

        <table>
          <thead>
            <tr>${tableHeadersHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml || "<tr><td colspan='8' style='text-align:center; padding: 20px;'>No records found for this period.</td></tr>"}
          </tbody>
        </table>

        <div class="footer">
          <div>Generated securely by SmartBill Cloud Billing</div>
          <div>Authorized Signatory: _________________________</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  } else {
    // If popups blocked, fall back to standard window print
    window.print();
  }
}
