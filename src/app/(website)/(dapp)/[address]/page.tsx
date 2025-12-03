import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { getVaultDetails } from "@/lib/vaults/actions";
import { VaultDetailContent } from "./vault-detail-content";
import { VaultDetailSkeleton } from "./vault-detail-skeleton";

interface VaultPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: VaultPageProps) {
  const { address } = await params;
  const vault = await getVaultDetails(address);

  if (!vault) {
    return {
      title: "Vault Not Found | Hyro Protocol",
    };
  }

  return {
    title: `${vault.name} | Hyro Protocol`,
    description: `View details, performance, and deposit into ${vault.name} vault managed by ${vault.manager?.name || "Anonymous"}.`,
  };
}

async function VaultLoader({ address }: { address: string }) {
  const vault = await getVaultDetails(address);

  if (!vault) {
    notFound();
  }

  return <VaultDetailContent vault={vault} />;
}

export default async function VaultPage({ params }: VaultPageProps) {
  const { address } = await params;

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<VaultDetailSkeleton />}>
        <VaultLoader address={address} />
      </Suspense>
    </main>
  );
}


