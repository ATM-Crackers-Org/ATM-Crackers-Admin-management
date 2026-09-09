

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
      margin: 12mm 15mm;
      size: A4 portrait;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.5;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .font-black { font-weight: 900; }
    .font-mono { font-family: 'Courier New', Courier, monospace; }
    .text-red-600 { color: #dc2626; }
    .text-slate-900 { color: #0f172a; }
    .text-slate-800 { color: #1e293b; }
    .text-slate-700 { color: #334155; }
    .text-slate-600 { color: #475569; }
    .text-slate-500 { color: #64748b; }
    .text-slate-400 { color: #94a3b8; }
    .text-emerald-600, .text-emerald-700 { color: #059669; }
    .bg-slate-50 { background-color: #f8fafc; }
    .bg-slate-100 { background-color: #f1f5f9; }
    .bg-slate-900 { background-color: #0f172a; color: #ffffff !important; }
    .border { border: 1px solid #e2e8f0; }
    .border-b { border-bottom: 1px solid #e2e8f0; }
    .border-t { border-top: 1px solid #e2e8f0; }
    .border-t-2 { border-top: 2px solid #0f172a; }
    .rounded { border-radius: 4px; }
    .rounded-lg { border-radius: 8px; }
    .rounded-xl { border-radius: 12px; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .w-full { width: 100%; }
    .w-56 { width: 224px; }
    .w-64 { width: 256px; }
    .space-y-1 > * + * { margin-top: 4px; }
    .space-y-1\\.5 > * + * { margin-top: 6px; }
    .space-y-6 > * + * { margin-top: 20px; }
    .p-3 { padding: 12px; }
    .p-6 { padding: 0; }
    .pb-4 { padding-bottom: 16px; }
    .pt-2 { padding-top: 8px; }
    .pt-4 { padding-top: 16px; }
    .px-2 { padding-left: 8px; padding-right: 8px; }
    .px-2\\.5 { padding-left: 10px; padding-right: 10px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
    .text-xs { font-size: 12px; }
    .text-sm { font-size: 14px; }
    .text-base { font-size: 16px; }
    .text-xl { font-size: 20px; }
    .uppercase { text-transform: uppercase; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      margin-bottom: 14px;
    }
    th, td {
      padding: 9px 10px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-weight: 700;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      font-size: 12px;
      color: #475569;
    }
    td {
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    tr:last-child td {
      border-bottom: 1px solid #cbd5e1;
    }
  `;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
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
