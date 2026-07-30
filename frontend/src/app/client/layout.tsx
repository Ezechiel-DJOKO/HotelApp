import ClientLayout from "@/components/client/layout/ClientLayout";

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}