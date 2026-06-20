import DictionaryPanel from '@/components/dictionary/DictionaryPanel';

export default function Dictionary() {
  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto h-full">
        <div className="mb-4">
          <h1 className="font-display text-phosphor text-2xl tracking-wider mb-1">废土字典</h1>
          <p className="text-sm font-mono text-phosphor-dim">
            破译过程中可查阅的废土世界术语词典
          </p>
        </div>
        <div className="divider-terminal mb-6" />
        <div className="h-[calc(100%-120px)]">
          <DictionaryPanel />
        </div>
      </div>
    </div>
  );
}
