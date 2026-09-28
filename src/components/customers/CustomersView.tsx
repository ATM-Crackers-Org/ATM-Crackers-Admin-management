"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Plus } from "lucide-react";
import { CustomerTable } from "./CustomerTable";
import { CustomerFormModal, CustomerFormData } from "./CustomerFormModal";

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, toggleCustomerActive } = useAdminStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubmit = (formData: CustomerFormData) => {
    addCustomer(formData);
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customer Directory"
        description="Registered wholesale and retail customer profiles across Tamil Nadu."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        }
      />

      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search customer name, phone, or town..."
        />
      </div>

      <CustomerTable
        customers={filteredCustomers}
        onToggleActive={toggleCustomerActive}
      />

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};
