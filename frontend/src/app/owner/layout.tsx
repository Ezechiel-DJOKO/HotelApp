import OwnerLayout from "@/components/owner/layout/OwnerLayout";

export default function OwnerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OwnerLayout>{children}</OwnerLayout>;
}