import React from "react";
import InvoiceModal from "@shared/components/invoice/InvoiceModal";

export default function POSInvoiceModal(props) {
  return (
    <div className="h-[calc(100vh-100px)] w-full">
      <InvoiceModal backLabel="Back to Billing" {...props} />
    </div>
  );
}
