// src/pages/ExpensesPage.jsx

import { useEffect, useState } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import PageWrapper from '../components/ui/PageWrapper'
import CloseButton from '../components/ui/CloseButton'
import { formatCurrency } from '../utils/formatCurrency'
import { EXPENSE_CATEGORIES } from '../config/constants'

const CATEGORY_CONFIG = {
  'Supermercado':    { icon: '🛒', color: 'bg-green-500/15 text-green-500 border-green-500/30' },
  'Servicios':       { icon: '💡', color: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30' },
  'Suscripciones':   { icon: '📱', color: 'bg-purple-500/15 text-purple-500 border-purple-500/30' },
  'Transporte':      { icon: '🚗', color: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
  'Salud':           { icon: '❤️', color: 'bg-red-500/15 text-red-500 border-red-500/30' },
  'Educación':       { icon: '📚', color: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30' },
  'Entretenimiento': { icon: '🎮', color: 'bg-pink-500/15 text-pink-500 border-pink-500/30' },
  'Otros':           { icon: '📦', color: 'bg-slate-500/15 text-slate-500 border-slate-500/30' },
}

const EMPTY_FORM = {
  description: '', amount: '',
  category: EXPENSE_CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
}

const ExpensesPage = () => {
  const { expenses, totalExpenses, expensesByCategory, isLoading, fetchExpenses, createExpense, removeExpense } = useExpenses()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [confirmId, setConfirmId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { fetchExpenses() }, [])

  const validate = () => {
    const e = {}
    if (!form.description.trim()) e.description = 'La descripción es requerida'
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Ingresá un monto válido'
    if (!form.date) e.date = 'La fecha es requerida'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setIsSaving(true)
    const result = await createExpense({ ...form, amount: Number(form.amount) })
    setIsSaving(false)
    if (result.success) { setIsModalOpen(false); setForm(EMPTY_FORM) }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    await removeExpense(confirmId)
    setIsDeleting(false)
    setConfirmId(null)
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const toggleCategory = (cat) =>
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])

  const filtered = selectedCategories.length === 0 ? expenses : expenses.filter((e) => selectedCategories.includes(e.category))

  return (
    <PageWrapper>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900">Gastos</h1>
            <p className="dark:text-slate-400 text-slate-500 text-sm mt-1">Total: {formatCurrency(totalExpenses)}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {EXPENSE_CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat]
            const amount = expensesByCategory[cat] || 0
            const isSelected = selectedCategories.includes(cat)
            return (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 text-center
                  ${isSelected ? `${config.color} scale-[0.97] shadow-lg` : 'dark:bg-white/5 bg-white dark:border-white/10 border-slate-200 dark:hover:bg-white/10 hover:bg-slate-50'}`}>
                <span className="text-2xl">{config.icon}</span>
                <span className={`text-xs font-semibold leading-tight ${isSelected ? '' : 'dark:text-slate-300 text-slate-700'}`}>{cat}</span>
                {amount > 0 && <span className={`text-xs font-bold ${isSelected ? '' : 'dark:text-slate-400 text-slate-500'}`}>{formatCurrency(amount)}</span>}
              </button>
            )
          })}
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm dark:text-slate-400 text-slate-500">Filtrando: <span className="dark:text-white text-slate-900 font-medium">{selectedCategories.join(', ')}</span></p>
            <button onClick={() => setSelectedCategories([])} className="text-xs text-indigo-400 hover:text-indigo-300">Limpiar filtros</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📤" title="Sin gastos registrados" description="Registrá tus gastos para ver en qué estás gastando"
            action={<Button onClick={() => setIsModalOpen(true)}>Agregar gasto</Button>} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((expense) => {
              const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['Otros']
              return (
                <Card key={expense.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${config.color}`}>{config.icon}</div>
                    <div>
                      <p className="dark:text-white text-slate-900 font-medium text-sm">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-md border ${config.color}`}>{expense.category}</span>
                        <span className="text-xs dark:text-slate-500 text-slate-400">{expense.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold text-sm">{formatCurrency(expense.amount)}</span>
                    <CloseButton onClick={() => setConfirmId(expense.id)} label="Eliminar gasto" />
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setForm(EMPTY_FORM); setErrors({}) }} title="Nuevo gasto">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input id="description" label="Descripción" placeholder="Ej: Supermercado Día..." value={form.description} onChange={handleChange('description')} error={errors.description} />
            <Input id="amount" label="Monto ($)" type="number" min="0" placeholder="0.00" value={form.amount} onChange={handleChange('amount')} error={errors.amount} />
            <Select id="category" label="Categoría" value={form.category} onChange={handleChange('category')}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_CONFIG[c]?.icon} {c}</option>)}
            </Select>
            <Input id="date" label="Fecha" type="date" value={form.date} onChange={handleChange('date')} error={errors.date} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" isLoading={isSaving} className="flex-1">Guardar</Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmId}
          onClose={() => setConfirmId(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="¿Eliminás este gasto?"
          description="Se eliminará permanentemente y no podrás recuperarlo."
        />
      </div>
    </PageWrapper>
  )
}

export default ExpensesPage
