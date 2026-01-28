import React from "react";

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${trendUp ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    );
}
