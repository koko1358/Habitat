/** Shared `.field-label` / inline error styling for the Maker cards. */
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-[7px] block text-[10.5px] font-bold tracking-[0.08em] text-hb-ink-faint uppercase"
    >
      {children}
    </label>
  );
}

export function FieldError({ message }: { message: string }) {
  return <p className="-mt-3 mb-3.5 text-xs text-destructive">{message}</p>;
}
