// src/pages/DashboardPage.jsx

import { useEffect, useMemo } from 'react'
import { useIncomes } from '../hooks/useIncomes'
import { useExpenses } from '../hooks/useExpenses'
import { useCreditCards } from '../hooks/useCreditCards'
import { useUser } from '../hooks/useUser'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import PageWrapper from '../components/ui/PageWrapper'
import { formatCurrency } from '../utils/formatCurrency'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#64748b']

const PieChart = ({ data }) => {
  const size = 180, cx = 90, cy = 90, r = 70, innerR = 40
  const total = data.reduce((acc, d) => acc + d.value, 0)
  if (total === 0) return null
  let cumulative = 0
  const slices = data.map((d, i) => {
    const start = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    cumulative += d.value
    const end = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    const largeArc = end - start > Math.PI ? 1 : 0
    const cos = (a) => Math.cos(a), sin = (a) => Math.sin(a)
    return {
      path: `M ${cx+innerR*cos(start)} ${cy+innerR*sin(start)} L ${cx+r*cos(start)} ${cy+r*sin(start)} A ${r} ${r} 0 ${largeArc} 1 ${cx+r*cos(end)} ${cy+r*sin(end)} L ${cx+innerR*cos(end)} ${cy+innerR*sin(end)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx+innerR*cos(start)} ${cy+innerR*sin(start)} Z`,
      color: COLORS[i % COLORS.length], label: d.label, value: d.value,
      pct: Math.round((d.value / total) * 100),
    }
  })
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity" />)}
      </svg>
      <div className="flex flex-col gap-2 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-sm dark:text-slate-300 text-slate-600 truncate">{s.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold dark:text-white text-slate-900">{formatCurrency(s.value)}</span>
              <span className="text-xs dark:text-slate-500 text-slate-400 w-8 text-right">{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const StatCard = ({ label, value, icon, colorClass, isLoading }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${colorClass}`}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs dark:text-slate-400 text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      {isLoading ? <Skeleton className="h-6 w-28 mt-1" /> : <p className="text-xl font-bold dark:text-white text-slate-900 truncate">{value}</p>}
    </div>
  </Card>
)

const DashboardPage = () => {
  const { displayName, fetchProfile, profile } = useUser()
  const { totalIncomes, fetchIncomes, isLoading: li } = useIncomes()
  const { totalExpenses, expensesByCategory, fetchExpenses, isLoading: le } = useExpenses()
  const { totalCardDebt, fetchCards, fetchCardExpenses, isLoading: lc } = useCreditCards()

  useEffect(() => {
    if (!profile) fetchProfile()
    fetchIncomes(); fetchExpenses(); fetchCards(); fetchCardExpenses()
  }, [])

  const isLoading = li || le || lc
  const balance = totalIncomes - totalExpenses - totalCardDebt
  const pieData = useMemo(() => Object.entries(expensesByCategory).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value), [expensesByCategory])

  return (
    <PageWrapper>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold dark:text-white text-slate-900">Hola, {displayName} 👋</h1>
          <p className="dark:text-slate-400 text-slate-500 text-sm mt-1">Resumen del mes actual</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard label="Ingresos" value={formatCurrency(totalIncomes)} icon="💰" colorClass="bg-emerald-500/20" isLoading={li} />
          <StatCard label="Gastos" value={formatCurrency(totalExpenses)} icon="📤" colorClass="bg-red-500/20" isLoading={le} />
          <StatCard label="Tarjetas" value={formatCurrency(totalCardDebt)} icon="💳" colorClass="bg-violet-500/20" isLoading={lc} />
          <StatCard label="Balance" value={formatCurrency(balance)} icon={balance >= 0 ? '📈' : '📉'} colorClass={balance >= 0 ? 'bg-indigo-500/20' : 'bg-orange-500/20'} isLoading={isLoading} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <h2 className="text-base font-semibold dark:text-white text-slate-900 mb-5">Distribución de gastos</h2>
            {le ? <div className="flex justify-center"><Skeleton className="w-40 h-40 rounded-full" /></div>
              : pieData.length === 0 ? <p className="dark:text-slate-400 text-slate-500 text-sm text-center py-10">Sin gastos registrados</p>
              : <PieChart data={pieData} />}
          </Card>
          <Card>
            <h2 className="text-base font-semibold dark:text-white text-slate-900 mb-5">Gastos por categoría</h2>
            {le ? <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
              : pieData.length === 0 ? <p className="dark:text-slate-400 text-slate-500 text-sm text-center py-10">Sin gastos registrados</p>
              : <div className="flex flex-col gap-4">
                  {pieData.map(({ label, value }, i) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="dark:text-slate-300 text-slate-600">{label}</span>
                        <span className="dark:text-white text-slate-900 font-semibold">{formatCurrency(value)}</span>
                      </div>
                      <div className="h-2 dark:bg-white/10 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${totalExpenses > 0 ? (value/totalExpenses)*100 : 0}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>}
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}

export default DashboardPage
