import RoleBasedLayout from "@/components/shared/RoleBasedLayout";

export default function AideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleBasedLayout>{children}</RoleBasedLayout>;
}