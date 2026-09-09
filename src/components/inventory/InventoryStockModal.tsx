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
      reference,
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Replenish or Adjust Cracker Stock"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select Cracker Item *
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Balance: {p.stockQuantity}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Operation Type
            </label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value as "IN" | "ADJUSTMENT")}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="IN">Inward / Replenishment (+)</option>
              <option value="ADJUSTMENT">Manual Adjustment (±)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Quantity Units *
            </label>
            <input
              type="number"
              required
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Reference Code (GRN or Audit ID)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono"
            placeholder="GRN-2026-081"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Adjustment Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Received from factory warehouse"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary text-sm font-semibold cursor-pointer">
            Apply Stock Update
          </button>
        </div>
      </form>
    </Modal>
  );
};
