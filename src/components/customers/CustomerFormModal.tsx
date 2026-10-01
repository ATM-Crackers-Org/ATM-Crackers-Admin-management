"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  isActive: boolean;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
}

const DEFAULT_CUSTOMER_FORM: CustomerFormData = {
  name: "",
  phone: "",
  email: "",
  city: "Sivakasi",
  isActive: true,
};

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(DEFAULT_CUSTOMER_FORM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(DEFAULT_CUSTOMER_FORM);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Customer"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            className="btn btn-primary text-sm font-semibold cursor-pointer shadow-md shadow-red-500/20"
          >
            Save Customer
          </button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Customer Full Name *
          </label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="e.g. Ramesh Kannan"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            minLength={10}
            maxLength={15}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="+91 98400 12345"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            maxLength={100}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="ramesh@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            City / District
          </label>
          <input
            type="text"
            maxLength={60}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Madurai, Chennai, Sivakasi"
          />
        </div>
      </form>
    </Modal>
  );
};
