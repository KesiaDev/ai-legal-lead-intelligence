import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLeads } from '@/contexts/LeadsContext';
import { LEGAL_AREAS, LegalArea } from '@/types/lead';

const COLORS = {
  trabalhista: '#1e3a5f',
  previdenciario: '#d4a439',
  familia: '#2d5a4a',
  civel: '#5a4a2d',
  penal: '#4a2d5a',
};

export function LeadsByAreaChart() {
  const { leads } = useLeads();

  const data = Object.entries(LEGAL_AREAS).map(([key, label]) => ({
    name: label,
    value: leads.filter(l => l.legalArea === key).length,
    color: COLORS[key as LegalArea],
  })).filter(d => d.value > 0);

  return (
    <div className="card-elevated rounded-xl p-6 animate-slide-up">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">
        Leads por Área do Direito
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
