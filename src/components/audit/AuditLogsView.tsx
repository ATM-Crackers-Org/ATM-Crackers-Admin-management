"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Trash2 } from "lucide-react";
import { AuditLogTable } from "./AuditLogTable";

export const AuditLogsView: React.FC = () => {
  const { auditLogs, clearAuditLogs } = useAdminStore();
  const [search, setSearch] = useState("");

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Audit Trail"
        description="Immutable log of administrative operations, stock changes, sales, and catalog edits."
        actions={
          <button
            onClick={clearAuditLogs}
            className="btn btn-secondary text-xs px-3 py-2 text-slate-600 hover:text-red-600 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search audit action, module, or user..."
        />
      </div>

      <AuditLogTable logs={filteredLogs} />
    </div>
  );
};
