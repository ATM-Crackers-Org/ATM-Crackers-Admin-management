import type { Metadata } from "next";
import "./globals.css";
import { AdminStoreProvider } from "@/context/admin-store";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "ATM Crackers — Admin Management Suite",
  description: "Exclusive Administrative Portal for ATM Crackers Sivakasi (Orders, Products, POS Billing, Inventory, Reports)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AdminStoreProvider>
          {children}
        </AdminStoreProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </body>
    </html>
  );
}
