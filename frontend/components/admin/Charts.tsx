"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", users: 120, plans: 34 },
  { month: "Fév", users: 190, plans: 52 },
  { month: "Mar", users: 280, plans: 71 },
  { month: "Avr", users: 340, plans: 89 },
  { month: "Mai", users: 450, plans: 105 },
  { month: "Jun", users: 600, plans: 140 },
];

export function Charts() {
  return (
    <div className="card-surface p-6 shadow-card">
      <h3 className="mb-5 font-display text-lg text-ink">Inscriptions & Business Plans</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E0156A" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#E0156A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPlans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7A1352" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7A1352" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1E9DE" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#4A3F47" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#4A3F47" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #F1E9DE", boxShadow: "0 8px 30px -12px rgba(30,22,32,.12)" }}
          />
          <Area type="monotone" dataKey="users" name="Utilisateurs" stroke="#E0156A" strokeWidth={2} fill="url(#gradUsers)" />
          <Area type="monotone" dataKey="plans" name="Business Plans" stroke="#7A1352" strokeWidth={2} fill="url(#gradPlans)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
