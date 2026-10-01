"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Product } from "@/data/mock-data";

interface InventoryStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProductId?: string;
  onSubmit: (data: {
    productId: string;
    qty: number;
    type: "IN" | "ADJUSTMENT";
    reference: string;
    notes: string;
  }) => void;
}

export const InventoryStockModal: React.FC<InventoryStockModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProductId,
  onSubmit,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId || products[0]?.id || ""
  );
  const [adjustType, setAdjustType] = useState<"IN" | "ADJUSTMENT">("IN");
  const [adjustQty, setAdjustQty] = useState(50);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialProductId) setSelectedProductId(initialProductId);
    setReference("GRN-2026-" + Math.floor(100 + Math.random() * 900));
    setNotes("Stock replenishment from factory batch");
    setAdjustQty(50);
    setAdjustType("IN");
  }, [initialProductId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productId: selectedProductId,
      qty: adjustQty,
      type: adjustType,
      reference: reference.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Replenish or Adjust Cracker Stock"
      maxWidth="lg"
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
            form="inventory-adjust-form"
            className="btn btn-primary text-sm font-semibold cursor-pointer shadow-md shadow-red-500/20"
          >
            Apply Stock Update
          </button>
        </>
      }
    >
      <form id="inventory-adjust-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Cracker Item *
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Balance: {p.stockQuantity} {p.unit}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operation Type *
            </label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value as "IN" | "ADJUSTMENT")}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium"
            >
              <option value="IN">Inward / Replenishment (+)</option>
              <option value="ADJUSTMENT">Manual Adjustment (±)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity Units (1 - 100,000) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={100000}
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Reference Code (GRN or Audit ID) *
            </label>
            <span className="text-[10px] text-slate-400">
              {reference.length} / 50
            </span>
          </div>
          <input
            type="text"
            required
            minLength={2}
            maxLength={50}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono"
            placeholder="GRN-2026-081"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Adjustment Notes
            </label>
            <span className="text-[10px] text-slate-400">
              {notes.length} / 300
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={300}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
            placeholder="Received from factory warehouse batch #14"
          />
        </div>
      </form>
    </Modal>
  );
};
