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
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        description="Registered wholesale and retail customer profiles across Tamil Nadu."
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
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
