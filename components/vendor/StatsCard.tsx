export default function StatsCard({
  label,
  value,
  color = "green",
  icon = "📊",
}: {
  label: string;
  value: string | number;
  color?: "green" | "blue" | "red";
  icon?: string;
}) {
  const colors = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <span className={`rounded-xl p-2 ${colors[color]}`}>
          {icon}
        </span>

        <span className="text-xs text-gray-400">
          {label}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold text-zinc-900">
        {value}
      </p>
    </div>
  );
}
