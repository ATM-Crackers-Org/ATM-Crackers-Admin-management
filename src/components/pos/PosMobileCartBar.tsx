"use client";

import React from "react";
import { formatINR } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface POSMobileCartBarProps {
  totalCartUnits: number;
  grandTotal: number;
  onOpenCart: () => void;
}

export function POSMobileCartBar({
  totalCartUnits,
  grandTotal,
  onOpenCart,
}: POSMobileCartBarProps) {
  if (totalCartUnits <= 0) return null;

  return (
    <div className="lg:hidden sticky bottom-2 z-30 px-2 animate-in slide-in-from-bottom-3 duration-200">
      <div className="bg-slate-950 text-white p-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {totalCartUnits} Crackers
            </span>
            <span className="font-black text-sm text-amber-400">
              {formatINR(grandTotal)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Ready for checkout & print</p>
        </div>
        <button
          type="button"
          onClick={onOpenCart}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold shadow-md shadow-red-900/40 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>View Bill & Pay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
