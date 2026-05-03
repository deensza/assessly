import RouteGuard from "@/components/RouteGuard";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["student"]}>
      {children}
    </RouteGuard>
  );
}
