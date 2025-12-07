import { ConnectionDrawer } from "@/components/connection-drawer";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export default function DappLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ConnectionDrawer />
      {children}
      <Toaster />
    </Providers>
  );
}
