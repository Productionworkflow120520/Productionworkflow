"use client";

import React, { useState } from "react";
import { Button, Modal } from "@/components/ui";

export default function DistributorSupportPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Support ticket raised successfully. Reference: TKT-" + Date.now().toString().slice(-6));
    setIsOpen(false);
    setSubject("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Distributor Support &amp; Helpdesk</h1>
          <p className="page-subheader">Raise wallet funding disputes or contact your assigned regional Admin</p>
        </div>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          + Open Support Ticket
        </Button>
      </div>

      <div className="card">
        <h2 className="text-base font-bold text-gray-900 mb-2">Dedicated Admin Contact</h2>
        <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-1.5 max-w-md">
          <div className="flex justify-between">
            <span className="text-gray-500">Regional Manager:</span>
            <span className="font-semibold text-gray-900">Rahul Sharma</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contact Mobile:</span>
            <span className="font-mono text-gray-900">+91 98888 00001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email:</span>
            <span className="text-blue-600">admin1@rechargepro.in</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Helpdesk Working Hours:</span>
            <span className="text-gray-800">09:00 AM - 08:00 PM IST (Mon - Sat)</span>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Submit Support Ticket">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="label">Issue Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Bank deposit UTR confirmation request"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Description / Remarks</label>
            <textarea
              rows={4}
              required
              placeholder="Provide transaction IDs or UTR numbers..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
