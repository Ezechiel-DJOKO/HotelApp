import RoleBasedLayout from "@/components/shared/RoleBasedLayout";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleBasedLayout>{children}</RoleBasedLayout>;
}