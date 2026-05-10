import { Card, CardDescription, CardTitle } from '@/components/ui/Card';

export function PlaceholderPage({ title, comingIn }: { title: string; comingIn: string }) {
  return (
    <Card padding="lg">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{comingIn}</CardDescription>
    </Card>
  );
}
