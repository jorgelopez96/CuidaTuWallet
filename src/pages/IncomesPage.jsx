// src/pages/IncomesPage.jsx

import { useEffect, useState } from 'react'
import { useIncomes } from '../hooks/useIncomes'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import PageWrapper from '../components/ui/PageWrapper'
import { formatCurrency } from '../utils/formatCurrency'

const EMPTY_FORM = {
  description: '', amount: '', type: 'salary',
  month: new Date().toISOString().slice(0, 7),
  payDay: '', expiresMonth: '',
}

const IncomesPage = () => {
  const { activeIncomes, archivedIncomes, incomesByMonth, totalIncomes, isLoading, fetchIncomes, createIncome, removeIncome } = useIncomes()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { fetchIncomes() }, [])

  const validate = () => {
    const e = {}
    if (!form.description.trim()) e.description = 'La descripción es requerida'
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Ingresá un monto válido'
    if (!form.month) e.month = 'El mes es requerido'
    if (form.type === 'salary' && !form.payDay) e.payDay = 'Ingresá el día de cobro'
    if (form.type === 'salary' && !form.expiresMonth) e.expiresMonth = 'Ingresá el mes de vencimiento'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setIsSaving(true)
    const result = await createIncome({ ...form, amount: Number(form.amount) })
    setIsSaving(false)
    if (result.success) { setIsModalOpen(false); setForm(EMPTY_FORM) }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    await removeIncome(confirmId)
    setIsDeleting(false)
    setConfirmId(null)
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const closeModal = () => { setIsModalOpen(false); setForm(EMPTY_FORM); setErrors({}) }

  return (
    <PageWrapper>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900">Ingresos</h1>
            <p className="dark:text-slate-400 text-slate-500 text-sm mt-1">Total activo: {formatCurrency(totalIncomes)}</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>+ Agregar</Button>
        </div>

        <div className="flex gap-2 mb-6">
          {['Activos', 'Historial'].map((tab, i) => (
            <button key={tab} onClick={() => setShowHistory(i === 1)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${showHistory === (i === 1) ? 'bg-indigo-600 text-white' : 'dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:bg-white/10 hover:bg-slate-200'}`}>
              {tab} {i === 1 && `(${archivedIncomes.length})`}
            </button>
          ))}
        </div>

        {!showHistory && (
          isLoading ? (
            <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : activeIncomes.length === 0 ? (
            <EmptyState icon="💰" title="Sin ingresos activos" description="Registrá tu sueldo u otros ingresos"
              action={<Button onClick={() => setIsModalOpen(true)}>Agregar ingreso</Button>} />
          ) : (
            <div className="flex flex-col gap-3">
              {activeIncomes.map((income) => (
                <Card key={income.id} className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="dark:text-white text-slate-900 font-medium">{income.description}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${income.type === 'salary' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-500'}`}>
                        {income.type === 'salary' ? 'Sueldo' : 'Otro'}
                      </span>
                    </div>
                    <p className="dark:text-slate-400 text-slate-500 text-xs mt-0.5">
                      {income.month}{income.type === 'salary' && income.payDay && ` · Cobro día ${income.payDay}`}{income.type === 'salary' && income.expiresMonth && ` · Vence ${income.expiresMonth}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-500 font-bold">{formatCurrency(income.amount)}</span>
                    <button onClick={() => setConfirmId(income.id)}
                      className="dark:text-slate-500 text-slate-400 hover:text-red-500 transition-colors" aria-label="Eliminar">✕</button>
                  </div>
                </Card>
              ))}
            </div>
          )
        )}

        {showHistory && (
          archivedIncomes.length === 0 ? (
            <EmptyState icon="📁" title="Sin historial" description="Los ingresos archivados aparecerán acá" />
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(incomesByMonth)
                .filter(([, list]) => list.some((i) => i.isArchived))
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, list]) => {
                  const archived = list.filter((i) => i.isArchived)
                  const monthTotal = archived.reduce((acc, i) => acc + i.amount, 0)
                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold dark:text-slate-300 text-slate-600 uppercase tracking-wider">{month}</h3>
                        <span className="text-sm font-bold text-emerald-500">{formatCurrency(monthTotal)}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {archived.map((income) => (
                          <Card key={income.id} className="flex items-center justify-between opacity-75">
                            <div>
                              <p className="dark:text-white text-slate-900 font-medium text-sm">{income.description}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-md ${income.type === 'salary' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-500'}`}>
                                {income.type === 'salary' ? 'Sueldo' : 'Otro'}
                              </span>
                            </div>
                            <span className="text-emerald-500 font-bold">{formatCurrency(income.amount)}</span>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          )
        )}

        <Modal isOpen={isModalOpen} onClose={closeModal} title="Nuevo ingreso">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Select id="type" label="Tipo de ingreso" value={form.type} onChange={handleChange('type')}>
              <option value="salary">Sueldo / Trabajo</option>
              <option value="other">Otra fuente</option>
            </Select>
            <Input id="description" label="Descripción" placeholder={form.type === 'salary' ? 'Ej: Sueldo empresa X' : 'Ej: Freelance, venta...'} value={form.description} onChange={handleChange('description')} error={errors.description} />
            <Input id="amount" label="Monto ($)" type="number" min="0" placeholder="0.00" value={form.amount} onChange={handleChange('amount')} error={errors.amount} />
            <Input id="month" label="Mes" type="month" value={form.month} onChange={handleChange('month')} error={errors.month} />
            {form.type === 'salary' && (
              <>
                <Input id="payDay" label="Día de cobro" type="number" min="1" max="31" placeholder="Ej: 25" value={form.payDay} onChange={handleChange('payDay')} error={errors.payDay} />
                <Input id="expiresMonth" label="Mes de vencimiento" type="month" value={form.expiresMonth} onChange={handleChange('expiresMonth')} error={errors.expiresMonth} />
                <p className="text-xs dark:text-slate-400 text-slate-500 bg-indigo-500/10 px-3 py-2 rounded-lg">
                  💡 Al vencer el mes indicado, este ingreso se archivará automáticamente
                </p>
              </>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Cancelar</Button>
              <Button type="submit" isLoading={isSaving} className="flex-1">Guardar</Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmId}
          onClose={() => setConfirmId(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="¿Eliminás este ingreso?"
          description="Se eliminará permanentemente y no podrás recuperarlo."
        />
      </div>
    </PageWrapper>
  )
}

export default IncomesPage
