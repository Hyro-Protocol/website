import { ConnectionDrawer } from "@/components/connection-drawer";
import { Providers } from "@/components/providers";

export default function DappLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ConnectionDrawer />
      {children}
    </Providers>
  );
}
