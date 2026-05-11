export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[#1F2937] text-white shadow-sm hover:bg-[#111827]",
    secondary: "bg-white text-[#111827] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#F9FAFB]",
    success: "bg-[#10B981] text-white shadow-sm hover:bg-[#059669]",
    danger: "bg-[#DC2626] text-white shadow-sm hover:bg-red-700",
    ghost: "text-[#374151] hover:bg-[#F3F4F6]",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
