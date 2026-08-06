import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ReadOnlyNotice({ what }: { what: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center text-slate-500">
        <Eye className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        <p className="font-medium text-slate-700">View-only access</p>
        <p className="text-sm mt-1">
          Your account can view data but not {what}. Ask an owner or admin to change your role in Settings.
        </p>
      </CardContent>
    </Card>
  );
}
