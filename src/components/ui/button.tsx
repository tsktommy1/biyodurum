export function Button({ children, className, ...props }) {
  return (
    <button
      className={`px-2 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

