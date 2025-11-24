import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BookOpen, 
  Target, 
  Building2, 
  Users 
} from 'lucide-react';

const recommendedDocs = [
  {
    path: '/docs/protocol',
    title: 'Protocol',
    description: 'Learn how HYRO operates as a decentralized vault protocol connecting LPs and managers through challenge-based verification.',
    icon: BookOpen,
  },
  {
    path: '/docs/vision',
    title: 'Vision & Mission',
    description: 'Understand HYRO\'s mission to democratize asset management through trustless, transparent capital allocation.',
    icon: Target,
  },
  {
    path: '/docs/architecture',
    title: 'Architecture',
    description: 'Explore the technical foundation built on Solana with modular smart contracts and oracle infrastructure.',
    icon: Building2,
  },
  {
    path: '/docs/managers',
    title: 'Managers',
    description: 'Discover how asset managers participate through challenge-based qualification and vault management.',
    icon: Users,
  },
];

export function RecommendedDocs() {
  return (
    <div className="mt-16 not-prose">
      <h2 className="text-2xl font-semibold mb-6">You may be interested in</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendedDocs.map((doc) => {
          const Icon = doc.icon;
          return (
            <Link key={doc.path} href={doc.path}>
              <Card className="h-full transition-all bg-card/50 hover:bg-card/100 border-border/50 hover:shadow-md hover:border-border cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">{doc.title}</CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

