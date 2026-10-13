"use client";

import React, { useState, useEffect } from "react";
import { Button, Badge, Modal } from "@/components/ui";

interface EnquiryItem {
  id: string;
  name: string;
  mobile: string;
  role: string;
  city: string;
  message: string;
  createdAt: string;
  status: "NEW_LEAD" | "CONTACTED" | "ONBOARDED" | "REJECTED" | string;
  notes?: string;
}

interface EnquiriesManagerViewProps {
  currentRole: "SUPER_ADMIN" | "ADMIN" | string;
}

export function EnquiriesManagerView({ currentRole }: EnquiriesManagerViewProps) {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // New Lead Form State
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    mobile: "",
    role: "Retailer",
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Selected Lead Note Modal
  const [activeLead, setActiveLead] = useState<EnquiryItem | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRole !== "ALL") params.append("role", selectedRole);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/enquire?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [selectedRole, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormSuccess(null);
    setFormError(null);

    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry lead.");
      }
      setFormSuccess(`Enquiry successfully created with ID: ${data.enquiryId}`);
      setLeadForm({
        name: "",
        mobile: "",
        role: "Retailer",
        city: "",
        message: "",
      });
      fetchEnquiries();
      setTimeout(() => {
        setIsNewLeadOpen(false);
        setFormSuccess(null);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Failed to create lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/enquire", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeLead) return;
    setIsUpdatingNote(true);
    try {
      const res = await fetch("/api/enquire", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeLead.id, notes: noteText }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === activeLead.id ? { ...item, notes: noteText } : item))
        );
        setActiveLead(null);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const totalCount = enquiries.length;
  const newCount = enquiries.filter((i) => i.status === "NEW_LEAD").length;
  const contactedCount = enquiries.filter((i) => i.status === "CONTACTED").length;
  const onboardedCount = enquiries.filter((i) => i.status === "ONBOARDED").length;

  return (
    <div className="space-y-6">
      {/* ─── Header & Direct Calling Info Strip ─── */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 gpu-composite">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-navy-950 uppercase tracking-wider">
              {currentRole === "SUPER_ADMIN" ? "👑 Super Admin Desk" : "🛡️ Admin Desk"}
            </span>
            <span className="text-xs text-blue-300 font-medium">
              Partnership &amp; Lead Management
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Enquiries &amp; Customer Acquisition
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Live stream of incoming partner registrations, white-label requests, and retailer enquiries submitted from the website.
          </p>
        </div>

        {/* Direct Helpline Badge & Quick Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-xs">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">
              📞 Direct Mobile Helpline
            </span>
            <div className="font-mono font-bold text-amber-300">
              7045470545 / 9867231230
            </div>
            <span className="text-[10px] text-gray-400 uppercase font-bold block mt-1">
              ☎️ Customer Care Landlines
            </span>
            <div className="font-mono text-[11px] text-blue-200">
              022 - 40160303 / 022 - 40103737
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => setIsNewLeadOpen(true)}
            className="shadow-lg shadow-blue-500/20"
          >
            <span>➕</span> New Enquiry
          </Button>
        </div>
      </div>

      {/* ─── Instant Onboarding Support Strip ─── */}
      <div className="p-4 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 rounded-xl border border-blue-500/30 text-xs text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          ⚡ <strong>Instant Onboarding:</strong> Get your Retailer, Distributor, Admin, or Super Admin account activated with instant float balance support.
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsNewLeadOpen(true)}
          className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold border-amber-400 text-xs shrink-0"
        >
          Open Intake Form
        </Button>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Leads</span>
          <div className="text-2xl font-black text-gray-900 mt-1 font-mono">{totalCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase">New Enquiries</span>
          <div className="text-2xl font-black text-blue-600 mt-1 font-mono">{newCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase">Contacted</span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">{contactedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase">Onboarded</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{onboardedCount}</div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, 10-digit mobile, city, or Lead ID..."
            className="input text-xs w-full"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span>Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="select text-xs"
            >
              <option value="ALL">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Super Distributor">Super Distributor</option>
              <option value="Master Distributor">Master Distributor</option>
              <option value="Distributor">Distributor</option>
              <option value="Retailer">Retailer</option>
              <option value="B2B Recharge Software">B2B Software</option>
              <option value="API Integration">API Partner</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select text-xs"
            >
              <option value="ALL">All Status</option>
              <option value="NEW_LEAD">New Lead</option>
              <option value="CONTACTED">Contacted</option>
              <option value="ONBOARDED">Onboarded</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={fetchEnquiries}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* ─── Leads Data Table ─── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Lead ID &amp; Date</th>
                <th className="px-4 py-3">Prospective Partner</th>
                <th className="px-4 py-3">Mobile &amp; City</th>
                <th className="px-4 py-3">Partnership Role</th>
                <th className="px-4 py-3">Requirements / Note</th>
                <th className="px-4 py-3">Lead Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`loading-${idx}`}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="skeleton h-4 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No enquiries match the selected filter.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-gray-900">{enq.id}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900">{enq.name}</div>
                      <div className="text-[11px] text-gray-500">Prospective Lead</div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-semibold text-blue-600 flex items-center gap-1">
                        <a href={`tel:${enq.mobile}`} className="hover:underline">
                          {enq.mobile}
                        </a>
                      </div>
                      <div className="text-[11px] text-gray-500">{enq.city || "Not Specified"}</div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {enq.role}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="text-gray-700 truncate" title={enq.message}>
                        {enq.message || "No specific requirement noted"}
                      </p>
                      {enq.notes && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 block truncate">
                          📝 {enq.notes}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                          enq.status === "NEW_LEAD"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : enq.status === "CONTACTED"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : enq.status === "ONBOARDED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <option value="NEW_LEAD">NEW LEAD</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="ONBOARDED">ONBOARDED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${enq.mobile}`}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          📞 Call
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveLead(enq);
                            setNoteText(enq.notes || "");
                          }}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded text-[11px] font-semibold"
                        >
                          Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Modal 1: New Enquiry Intake Form (Given to Super Admin & Admin) ─── */}
      <Modal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        title="Add New Enquiry / Lead"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <p className="text-xs text-gray-600">
            Fill the partnership details below to record an enquiry received over phone or in-person:
          </p>

          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 rounded-lg font-medium">
              ✅ {formSuccess}
            </div>
          )}

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="input text-xs w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                10-Digit Mobile Number *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={leadForm.mobile}
                onChange={(e) =>
                  setLeadForm({ ...leadForm, mobile: e.target.value.replace(/\D/g, "") })
                }
                placeholder="e.g. 9820112233"
                className="input text-xs w-full font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                City / State
              </label>
              <input
                type="text"
                value={leadForm.city}
                onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                placeholder="e.g. Mumbai, Maharashtra"
                className="input text-xs w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Partnership Type *
            </label>
            <select
              value={leadForm.role}
              onChange={(e) => setLeadForm({ ...leadForm, role: e.target.value })}
              className="select text-xs w-full"
            >
              <option value="Super Admin">Super Admin (System Owner &amp; Control)</option>
              <option value="Admin">Admin (Franchise &amp; Management)</option>
              <option value="Super Distributor">Super Distributor (State Partner)</option>
              <option value="Master Distributor">Master Distributor (Regional Lead)</option>
              <option value="Distributor">Distributor (Onboard Retailers)</option>
              <option value="Retailer">Retailer (Recharge &amp; Bill Payments)</option>
              <option value="B2B Recharge Software">B2B Recharge Software / White-Label</option>
              <option value="API Integration">API Partner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Your Requirements / Message (Optional)
            </label>
            <textarea
              rows={3}
              value={leadForm.message}
              onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
              placeholder="Tell us about your business or services you are looking to start..."
              className="input text-xs w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsNewLeadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Save Enquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal 2: Notes / Follow-up Updates ─── */}
      <Modal
        isOpen={!!activeLead}
        onClose={() => setActiveLead(null)}
        title={`Follow-up Notes: ${activeLead?.name}`}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Contact:</span>
              <span className="font-mono font-bold text-blue-600">{activeLead?.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role Requested:</span>
              <span className="font-semibold">{activeLead?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">City:</span>
              <span>{activeLead?.city}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Internal Team Follow-up Notes:
            </label>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Spoke to client on phone, interested in 50 retailer pack. Follow-up scheduled for Friday."
              className="input text-xs w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setActiveLead(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isUpdatingNote}
              onClick={handleSaveNotes}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default React.memo(EnquiriesManagerView);
