// src/pages/CardDetailPage.jsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCreditCards } from '../hooks/useCreditCards'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Input from '../components/ui/Input'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import PageWrapper from '../components/ui/PageWrapper'
import CloseButton from '../components/ui/CloseButton'
import { formatCurrency } from '../utils/formatCurrency'

const EMPTY_EXPENSE_FORM = {
  description: '', totalAmount: '', totalInstallments: '1',
  paidInstallments: '0', date: new Date().toISOString().slice(0, 10),
}

const InstallmentBar = ({ paid, total }) => {
  const pct = total > 0 ? (paid / total) * 100 : 0
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs dark:text-slate-400 text-slate-500 mb-1">
        <span>{paid} de {total} cuotas pagadas</span>
        <span className="font-medium">{total - paid} restantes</span>
      </div>
      <div className="h-1.5 dark:bg-white/10 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const CardDetailPage = () => {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const { cards, isLoading, fetchCards, fetchCardExpenses, createCardExpense, removeCardExpense, updateCard, getExpensesByCard } = useCreditCards()

  const [expenseModal, setExpenseModal] = useState(false)
  const [closingModal, setClosingModal] = useState(false)
  const [closingDay, setClosingDay] = useState('')
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE_FORM)
  const [expenseErrors, setExpenseErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { fetchCards(); fetchCardExpenses() }, [])

  const card = cards.find((c) => c.id === cardId)
  const expenses = getExpensesByCard(cardId)
  const totalDebt = expenses.reduce((acc, e) => acc + (e.currentInstallmentAmount || 0), 0)

  const validateExpense = () => {
    const e = {}
    if (!expenseForm.description.trim()) e.description = 'La descripción es requerida'
    if (!expenseForm.totalAmount || Number(expenseForm.totalAmount) <= 0) e.totalAmount = 'Ingresá un monto válido'
    if (Number(expenseForm.totalInstallments) < 1) e.totalInstallments = 'Mínimo 1 cuota'
    if (Number(expenseForm.paidInstallments) < 0) e.paidInstallments = 'No puede ser negativo'
    if (Number(expenseForm.paidInstallments) >= Number(expenseForm.totalInstallments)) e.paidInstallments = 'Debe ser menor al total'
    return e
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    const e2 = validateExpense()
    if (Object.keys(e2).length) { setExpenseErrors(e2); return }
    setIsSaving(true)
    const total = Number(expenseForm.totalAmount)
    const totalInst = Number(expenseForm.totalInstallments)
    const paidInst = Number(expenseForm.paidInstallments)
    const result = await createCardExpense({
      ...expenseForm, cardId, totalAmount: total,
      totalInstallments: totalInst, paidInstallments: paidInst,
      currentInstallmentAmount: total / totalInst,
      remainingInstallments: totalInst - paidInst,
    })
    setIsSaving(false)
    if (result.success) { setExpenseModal(false); setExpenseForm(EMPTY_EXPENSE_FORM) }
  }

  const handleClosingUpdate = async () => {
    if (!closingDay || closingDay < 1 || closingDay > 31) return
    await updateCard(cardId, { closingDay: Number(closingDay) })
    setClosingModal(false)
    setClosingDay('')
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    await removeCardExpense(confirmId)
    setIsDeleting(false)
    setConfirmId(null)
  }

  const handleChange = (field) => (e) => {
    setExpenseForm((prev) => ({ ...prev, [field]: e.target.value }))
    setExpenseErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const cuotaPreview = expenseForm.totalAmount && expenseForm.totalInstallments
    ? Number(expenseForm.totalAmount) / Number(expenseForm.totalInstallments) : null

  if (isLoading) {
    return <div className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col gap-4">
      <Skeleton className="h-8 w-40" /><Skeleton className="h-40 w-full" /><Skeleton className="h-24 w-full" />
    </div>
  }

  if (!card) {
    return <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <EmptyState icon="💳" title="Tarjeta no encontrada" description="La tarjeta que buscás no existe o fue eliminada"
        action={<Button onClick={() => navigate('/credit-cards')}>Volver a tarjetas</Button>} />
    </div>
  }

  return (
    <PageWrapper>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <button onClick={() => navigate('/credit-cards')}
          className="flex items-center gap-2 text-sm dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a tarjetas
        </button>

        <Card className="relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 pointer-events-none rounded-2xl" />
          <div className="relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs dark:text-slate-400 text-slate-500 mb-1">{card.type}</p>
                <h1 className="text-2xl font-bold dark:text-white text-slate-900">{card.alias}</h1>
              </div>
              <div className="text-right">
                <p className="text-xs dark:text-slate-400 text-slate-500">Cuota este mes</p>
                <p className="text-2xl font-bold text-violet-500">{formatCurrency(totalDebt)}</p>
              </div>
            </div>
            <p className="dark:text-slate-400 text-slate-500 text-sm mb-3">•••• •••• •••• {card.lastFour}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs dark:text-slate-500 text-slate-400">Cierre: día {card.closingDay || '—'}</span>
              <button onClick={() => { setClosingModal(true); setClosingDay(card.closingDay?.toString() || '') }}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Editar</button>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold dark:text-white text-slate-900">Gastos en cuotas ({expenses.length})</h2>
          <Button onClick={() => setExpenseModal(true)}>+ Agregar gasto</Button>
        </div>

        {expenses.length === 0 ? (
          <EmptyState icon="🧾" title="Sin gastos en esta tarjeta" description="Agregá tus compras en cuotas para hacer el seguimiento"
            action={<Button onClick={() => setExpenseModal(true)}>Agregar gasto</Button>} />
        ) : (
          <div className="flex flex-col gap-3">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="dark:text-white text-slate-900 font-medium">{expense.description}</p>
                    <p className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">{expense.date}</p>
                    <InstallmentBar paid={expense.paidInstallments} total={expense.totalInstallments} />
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                    <p className="text-violet-500 font-bold">{formatCurrency(expense.currentInstallmentAmount)}<span className="text-xs font-normal dark:text-slate-400 text-slate-500">/mes</span></p>
                    <p className="text-xs dark:text-slate-500 text-slate-400">{formatCurrency(expense.totalAmount)} total</p>
                    <CloseButton onClick={() => setConfirmId(expense.id)} label="Eliminar gasto" size="sm" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={expenseModal} onClose={() => { setExpenseModal(false); setExpenseForm(EMPTY_EXPENSE_FORM); setExpenseErrors({}) }} title={`Nuevo gasto — ${card.alias}`}>
          <form onSubmit={handleExpenseSubmit} noValidate className="flex flex-col gap-4">
            <Input id="exp-desc" label="Descripción" placeholder="Ej: Netflix, Falabella..." value={expenseForm.description} onChange={handleChange('description')} error={expenseErrors.description} />
            <Input id="exp-total" label="Monto total ($)" type="number" min="0" placeholder="0.00" value={expenseForm.totalAmount} onChange={handleChange('totalAmount')} error={expenseErrors.totalAmount} />
            <div className="grid grid-cols-2 gap-3">
              <Input id="exp-inst" label="Total cuotas" type="number" min="1" placeholder="12" value={expenseForm.totalInstallments} onChange={handleChange('totalInstallments')} error={expenseErrors.totalInstallments} />
              <Input id="exp-paid" label="Cuotas pagadas" type="number" min="0" placeholder="0" value={expenseForm.paidInstallments} onChange={handleChange('paidInstallments')} error={expenseErrors.paidInstallments} />
            </div>
            <Input id="exp-date" label="Fecha de compra" type="date" value={expenseForm.date} onChange={handleChange('date')} />
            {cuotaPreview && (
              <p className="text-sm text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-lg">
                💳 Cuota mensual: <strong>{formatCurrency(cuotaPreview)}</strong> · Quedan {Number(expenseForm.totalInstallments) - Number(expenseForm.paidInstallments)} cuotas
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setExpenseModal(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" isLoading={isSaving} className="flex-1">Guardar</Button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={closingModal} onClose={() => setClosingModal(false)} title="Editar fecha de cierre">
          <div className="flex flex-col gap-4">
            <Input id="closing" label="Día de cierre" type="number" min="1" max="31" placeholder="Ej: 15" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} />
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setClosingModal(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleClosingUpdate} className="flex-1">Guardar</Button>
            </div>
          </div>
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

export default CardDetailPage
