"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Flame,
  Gift,
  ShoppingBag,
  FileText,
  User,
  Phone,
  Store,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { AggregatedCustomer } from "@/types/customer.types";
import { toast } from "react-toastify";

const STORE_URL = "https://atm-crackers-site.on-forge.com/";
const PDF_URL = "https://atm-crackers-site.on-forge.com/ATM_Crackers_Price_List_2026.pdf";

interface WhatsAppMessageModalProps {
  customer: AggregatedCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

type TemplateKey = "diwali_announcement" | "new_arrivals" | "loyal_customer" | "custom";

export const WhatsAppMessageModal: React.FC<WhatsAppMessageModalProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("diwali_announcement");
  const [messageText, setMessageText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Template generators
  const getTemplateContent = (key: TemplateKey, cust: AggregatedCustomer): string => {
    const custName = cust.name || "Customer";

    switch (key) {
      case "diwali_announcement":
        return `வணக்கம் ${custName}! 🪔✨

*ATM Crackers - Sivakasi* இனிய தீபாவளி 2026 பட்டாசு முன்பதிவு ஆரம்பம்! 🎆

💥 *எங்கள் சிறப்பம்சங்கள்:*
• நேரடி சிவகாசி தொழிற்சாலை விலை
• 80% வரை அதிரடி தள்ளுபடி (Flat Discounts)
• 100% தரமான பசுமை பட்டாசுகள் (Standard Green Crackers)
• பாதுகாப்பான டோர் டெலிவரி வசதி (All Over Tamil Nadu)

🛒 *ஆன்லைனில் பட்டாசு ஆர்டர் செய்ய (Website):*
${STORE_URL}

📄 *தீபாவளி முழு விலைப்பட்டியல் (Download Price List PDF):*
${PDF_URL}

உங்கள் குடும்பத்தினருடன் இணைந்து மகிழ்ச்சியாகவும் பாதுகாப்பாகவும் தீபாவளியைக் கொண்டாட இப்போதே ஆர்டர் செய்யுங்கள்! 🪔💥

— *ATM CRACKERS, SIVAKASI*
📞 உதவிக்கு: +91 98421 23456`;

      case "new_arrivals":
        return `வணக்கம் ${custName}! 🎇

*ATM Crackers* புதிய பட்டாசு வரவுகள் இப்போது கிடைக்கின்றன! 💥

✨ *புதிய வரவுகள்:*
• 12 to 240 Shots Fancy Sky Aerial Repeaters 🎆
• Multi-Color Special Sparklers & Flower Pots 🌸
• Kids Safe Family Gift Box Combos 🎁

குறைந்த அளவே இருப்பு உள்ளதால் இன்றே உங்கள் விருப்பமான பட்டாசுகளை முன்கூட்டியே தேர்வு செய்யுங்கள்!

🛒 *இப்போதே பார்வையிட:*
${STORE_URL}

— *ATM CRACKERS SIVAKASI*`;

      case "loyal_customer":
        return `வணக்கம் ${custName}! 🪔

*ATM Crackers* நிறுவனத்தின் மீது நீங்கள் வைத்துள்ள நம்பிக்கைக்கு மனமார்ந்த நன்றிகள்! (ஆர்டர்கள்: ${cust.totalOrders}) 💥

எங்களின் சிறப்பு வாடிக்கையாளரான உங்களுக்கு இந்த தீபாவளிக்கான பிரத்யேக கூடுதல் தள்ளுபடி சலுகை மற்றும் உடனடி முன்பதிவு வசதி தயாராக உள்ளது!

🛒 *உங்கள் தீபாவளி பட்டாசு ஆர்டரை உறுதிசெய்ய:*
${STORE_URL}

மகிழ்ச்சியான தீபாவளி நல்வாழ்த்துகள்! 🪔✨
— *ATM CRACKERS*`;

      case "custom":
        return `வணக்கம் ${custName}! 🪔

ATM Crackers சிவகாசி - தீபாவளி 2026 பட்டாசு பட்டியல்:
${STORE_URL}

நன்றி!`;
    }
  };

  useEffect(() => {
    if (customer && isOpen) {
      setMessageText(getTemplateContent(selectedTemplate, customer));
    }
  }, [customer, selectedTemplate, isOpen]);

  if (!customer) return null;

  const handleSelectTemplate = (template: TemplateKey) => {
    setSelectedTemplate(template);
    setMessageText(getTemplateContent(template, customer));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success("Message copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy message.");
    }
  };

  const handleSendWhatsApp = () => {
    if (!customer.cleanMobile) {
      toast.error("Customer does not have a valid mobile number.");
      return;
    }

    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${customer.cleanMobile}?text=${encoded}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success(`Opening WhatsApp chat with ${customer.name}...`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send WhatsApp Customer Message"
      maxWidth="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open & Send in WhatsApp</span>
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Recipient Profile Banner */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {customer.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {customer.name}
              </div>
              <div className="text-[11px] font-mono font-medium text-emerald-700 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{customer.mobile}</span>
                {customer.city && (
                  <span className="text-slate-400 font-sans">• {customer.city}</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Orders History
            </span>
            <span className="text-xs font-black text-slate-800">
              {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>

        {/* Template Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Message Template
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSelectTemplate("diwali_announcement")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTemplate === "diwali_announcement"
                  ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Diwali 2026</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                Booking & Price List
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate("new_arrivals")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTemplate === "new_arrivals"
                  ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>New Arrivals</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                Fresh Stock Release
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate("loyal_customer")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTemplate === "loyal_customer"
                  ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Gift className="w-3.5 h-3.5 text-purple-500" />
                <span>Loyal Customer</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                Thank You & Discount
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTemplate("custom")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTemplate === "custom"
                  ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                <span>Custom</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                Write Your Own
              </p>
            </button>
          </div>
        </div>

        {/* Message Editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Message Content (Editable)
            </label>
            <span className="text-[10px] text-slate-400">
              {messageText.length} characters
            </span>
          </div>
          <textarea
            rows={7}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm font-sans bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
          />
        </div>

        {/* Real-time WhatsApp Message Preview Bubble */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Customer WhatsApp Chat Bubble Preview
          </div>
          <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-slate-200 shadow-inner relative overflow-hidden">
            <div className="max-w-md bg-white p-3 rounded-2xl rounded-tl-sm shadow-xs border border-emerald-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {messageText}
              <div className="text-[9px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span className="text-emerald-500 font-black">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
