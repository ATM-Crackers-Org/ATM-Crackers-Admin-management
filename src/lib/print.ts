

export function printBillElement(elementId: string, options?: { isThermal?: boolean; title?: string }) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element #${elementId} not found. Falling back to native print.`);
    window.print();
    return;
  }

  // Deep clone to avoid touching live React DOM
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove any interactive buttons or items marked with .no-print
  const buttonsAndControls = clone.querySelectorAll(".no-print, button");
  buttonsAndControls.forEach((node) => node.remove());

  const isThermal = options?.isThermal ?? false;
  const title = options?.title || "ATM Crackers Bill";

  // Create invisible print transport iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Clean, high-contrast typography designed specifically for printers
  const thermalStyles = `
    @page {
      margin: 2mm;
      size: 80mm auto;
    }
    body {
      font-family: 'Courier New', Courier, monospace, monospace;
      width: 74mm;
      max-width: 74mm;
      margin: 0 auto;
      padding: 2mm;
      color: #000000;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.35;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .border-b { border-bottom: 1px dashed #333; }
    .border-t { border-top: 1px dashed #333; }
    .border-b-2 { border-bottom: 2px dashed #000; }
    .border-t-2 { border-top: 2px dashed #000; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .w-full { width: 100%; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .uppercase { text-transform: uppercase; }
    .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .py-2 { padding-top: 6px; padding-bottom: 6px; }
    .pt-1 { padding-top: 4px; }
    .pt-2 { padding-top: 6px; }
    .pt-3 { padding-top: 8px; }
    .pb-1 { padding-bottom: 4px; }
    .pb-2 { padding-bottom: 6px; }
    .space-y-0\\.5 > * + * { margin-top: 2px; }
    .space-y-1 > * + * { margin-top: 4px; }
    .space-y-2 > * + * { margin-top: 6px; }
  `;

  const a4Styles = `
    @page {
      margin: 10mm 12mm 12mm 12mm;
      size: A4 portrait;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.45;
      position: relative;
    }

    /* Fixed Watermark Logo on every printed page */
    .print-watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 380px;
      max-width: 65%;
      opacity: 0.07;
      pointer-events: none;
      z-index: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-watermark img {
      width: 100%;
      height: auto;
      object-fit: contain;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .printable-content-layer {
      position: relative;
      z-index: 1;
      background: transparent !important;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .font-black { font-weight: 900; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
    .text-red-600 { color: #dc2626 !important; }
    .text-slate-900 { color: #0f172a !important; }
    .text-slate-800 { color: #1e293b !important; }
    .text-slate-700 { color: #334155 !important; }
    .text-slate-600 { color: #475569 !important; }
    .text-slate-500 { color: #64748b !important; }
    .text-slate-400 { color: #94a3b8 !important; }
    .text-emerald-600, .text-emerald-700 { color: #059669 !important; }
    .bg-slate-50 { background-color: #f8fafc !important; }
    .bg-slate-100 { background-color: #f1f5f9 !important; }
    .bg-slate-900 { background-color: #0f172a !important; color: #ffffff !important; }
    .bg-red-600 { background-color: #dc2626 !important; color: #ffffff !important; }
    .border { border: 1px solid #cbd5e1; }
    .border-b { border-bottom: 1px solid #cbd5e1; }
    .border-b-2 { border-bottom: 2px solid #0f172a; }
    .border-t { border-top: 1px solid #cbd5e1; }
    .border-t-2 { border-top: 2px solid #0f172a; }
    .rounded { border-radius: 4px; }
    .rounded-lg { border-radius: 8px; }
    .rounded-xl { border-radius: 12px; }
    .rounded-2xl { border-radius: 16px; }
    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .flex-col { flex-direction: column; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .gap-4 { gap: 16px; }
    .gap-6 { gap: 24px; }
    .w-full { width: 100%; }
    .w-12 { width: 48px; }
    .w-24 { width: 96px; }
    .w-28 { width: 112px; }
    .w-56 { width: 224px; }
    .w-64 { width: 256px; }
    .space-y-0\\.5 > * + * { margin-top: 2px; }
    .space-y-1 > * + * { margin-top: 4px; }
    .space-y-1\\.5 > * + * { margin-top: 6px; }
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-4 > * + * { margin-top: 16px; }
    .space-y-5 > * + * { margin-top: 20px; }
    .space-y-6 > * + * { margin-top: 24px; }
    .p-3 { padding: 12px; }
    .p-4 { padding: 14px; }
    .p-6 { padding: 0; }
    .pb-1 { padding-bottom: 4px; }
    .pb-2 { padding-bottom: 8px; }
    .pb-3 { padding-bottom: 12px; }
    .pb-4 { padding-bottom: 16px; }
    .pt-1 { padding-top: 4px; }
    .pt-2 { padding-top: 8px; }
    .pt-3 { padding-top: 12px; }
    .pt-4 { padding-top: 16px; }
    .px-2 { padding-left: 8px; padding-right: 8px; }
    .px-2\\.5 { padding-left: 10px; padding-right: 10px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .py-1\\.5 { padding-top: 6px; padding-bottom: 6px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
    .text-xs { font-size: 11px; }
    .text-sm { font-size: 13px; }
    .text-base { font-size: 15px; }
    .text-lg { font-size: 18px; }
    .text-xl { font-size: 20px; }
    .text-2xl { font-size: 24px; }
    .uppercase { text-transform: uppercase; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }
    .line-through { text-decoration: line-through; }
    .inline-block { display: inline-block; }

    /* Page-break friendliness */
    .invoice-header, .invoice-summary, .invoice-footer, .invoice-section {
      page-break-inside: avoid;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 10px;
      page-break-inside: auto;
    }
    thead {
      display: table-header-group;
    }
    tfoot {
      display: table-footer-group;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th, td {
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9 !important;
      font-weight: 700;
      border-top: 1.5px solid #0f172a;
      border-bottom: 1.5px solid #0f172a;
      font-size: 10.5px;
      color: #0f172a !important;
    }
    td {
      border-bottom: 1px solid #e2e8f0;
      font-size: 11.5px;
    }
    tr:last-child td {
      border-bottom: 1.5px solid #0f172a;
    }
  `;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <base href="${typeof window !== "undefined" ? window.location.origin : ""}" />
        <title>${title}</title>
        <style>
          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          ${isThermal ? thermalStyles : a4Styles}
        </style>
      </head>
      <body>
        ${clone.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Trigger print cleanly once document writes are flushed
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Iframe print error:", err);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 200);
}
