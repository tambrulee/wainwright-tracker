"use client";

type Props = {
  isOpen: boolean;
  routeName: string;
  onRouteNameChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function SaveRouteModal({
  isOpen,
  routeName,
  onRouteNameChange,
  onClose,
  onSave,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800">
          Save route
        </p>

        <h2 className="mt-1 text-2xl font-black text-stone-950">
          Name this route
        </h2>

        <input
          value={routeName}
          onChange={(e) => onRouteNameChange(e.target.value)}
          placeholder="e.g. Buttermere big day"
          className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 font-bold"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={!routeName.trim()}
            className="rounded-xl bg-emerald-900 px-4 py-2 font-black text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}