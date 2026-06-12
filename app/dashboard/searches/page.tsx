import { SearchesPanel } from '@/components/dashboard/SearchesPanel';

export default function SearchesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Saved searches</h1>
      <SearchesPanel />
    </div>
  );
}
