export default function Input({ label, className = "", ...props }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-[#374151]">
      {label}
      <input
        className={`h-10 w-full min-w-0 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-gray-400 focus:border-[#1F2937] focus:ring-2 focus:ring-[#1F2937]/10 ${className}`}
        {...props}
      />
    </label>
  );
}
