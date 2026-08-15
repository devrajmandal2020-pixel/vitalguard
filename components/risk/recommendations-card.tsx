import { Eye, Stethoscope, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Recommendation } from '@/types';

const categoryConfig = {
  Monitoring: { icon: Eye, color: 'text-blue-600 bg-blue-50' },
  'Clinical Review': { icon: Stethoscope, color: 'text-indigo-600 bg-indigo-50' },
  'Data Collection': { icon: Database, color: 'text-teal-600 bg-teal-50' },
};

export function RecommendationsCard({ recommendations }: { recommendations: Recommendation[] }) {
  const categories = (['Monitoring', 'Clinical Review', 'Data Collection'] as const).map((cat) => ({
    category: cat,
    items: recommendations.filter((r) => r.category === cat),
  })).filter((c) => c.items.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recommended Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {categories.map(({ category, items }) => {
          const config = categoryConfig[category];
          const Icon = config.icon;
          return (
            <div key={category}>
              <div className="mb-2.5 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-semibold">{category}</h4>
              </div>
              <ul className="ml-9 space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
