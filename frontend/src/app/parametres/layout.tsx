import RoleBasedLayout from "@/components/shared/RoleBasedLayout";

export default function ParametresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleBasedLayout>{children}</RoleBasedLayout>;
}