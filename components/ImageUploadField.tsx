"use client";

type ImageUploadFieldProps = {
  id: string;
  label: string;
  currentUrl?: string | null;
  currentPath?: string | null;
  onChange: (file: File | null) => void;
};

export function ImageUploadField({
  id,
  label,
  currentUrl,
  currentPath,
  onChange,
}: ImageUploadFieldProps) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
        {currentUrl || currentPath ? (
          <div className="mb-3 flex items-center gap-3">
            {currentUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUrl}
                alt=""
                className="h-16 w-24 rounded-md object-cover"
              />
            ) : (
              <div className="h-16 w-24 rounded-md bg-slate-200" />
            )}
            <p className="min-w-0 flex-1 truncate text-xs text-slate-500">
              {currentPath}
            </p>
          </div>
        ) : null}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </div>
    </label>
  );
}
