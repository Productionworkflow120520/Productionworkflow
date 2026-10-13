"use client";

import React, { useState } from "react";
import { Button, Modal } from "@/components/ui";

export default function RetailerSupportPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [txnRef, setTxnRef] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Complaint logged successfully! Ticket Reference: TKT-" + Date.now().toString().slice(-6));
    setIsOpen(false);
    setTxnRef("");
    setRemarks("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Merchant Support &amp; Dispute Helpdesk</h1>
          <p className="page-subheader">Raise recharge timeout issues, BBPS complaints, or wallet top-up questions</p>
        </div>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          + Log Transaction Complaint
        </Button>
      </div>

      <div className="card max-w-xl">
        <h2 className="text-base font-bold text-gray-900 mb-3">Your Assigned Distributor Contact</h2>
        <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Distributor Agency:</span>
            <span className="font-semibold text-gray-900">Amit Telecom Agency</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contact Partner:</span>
            <span className="font-medium text-gray-900">Amit Kumar</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone:</span>
            <span className="font-mono text-gray-900">+91 97777 00001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Priority WhatsApp:</span>
            <span className="text-green-700 font-semibold">+91 97777 00001</span>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Log Dispute Ticket">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="label">Transaction Reference / Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. TXN-20261012-XXXX or 98XXXXXXXX"
              value={txnRef}
              onChange={(e) => setTxnRef(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Problem Details *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe the issue (e.g. Balance debited but recharge SMS not received by customer)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Dispute
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
