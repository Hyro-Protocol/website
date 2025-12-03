import { Providers } from "@/components/providers";

export default function DappLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            {children}
        </Providers>
    );
}