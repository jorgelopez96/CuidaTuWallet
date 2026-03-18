// src/pages/CreditCardsPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreditCards } from '../hooks/useCreditCards'
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
import { CARD_TYPES } from '../config/constants'

const EMPTY_CARD_FORM = { alias: '', type: CARD_TYPES[0], lastFour: '', closingDay: '' }

const CARD_GRADIENTS = [
  'from-indigo-600/30 to-violet-600/30',
  'from-violet-600/30 to-pink-600/30',
  'from-blue-600/30 to-indigo-600/30',
  'from-emerald-600/30 to-teal-600/30',
]

const CreditCardsPage = () => {
  const navigate = useNavigate()
  const { cards, totalCardDebt, isLoading, fetchCards, fetchCardExpenses, createCard, removeCard, getExpensesByCard } = useCreditCards()
  const [cardModal, setCardModal] = useState(false)
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM)
  const [cardErrors, setCardErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { fetchCards(); fetchCardExpenses() }, [])

  const validateCard = () => {
    const e = {}
    if (!cardForm.alias.trim()) e.alias = 'El nombre es requerido'
    if (!cardForm.lastFour || cardForm.lastFour.length !== 4) e.lastFour = 'Ingresá los últimos 4 dígitos'
    if (!cardForm.closingDay || cardForm.closingDay < 1 || cardForm.closingDay > 31) e.closingDay = 'Ingresá un día válido (1-31)'
    return e
  }

  const handleCardSubmit = async (e) => {
    e.preventDefault()
    const e2 = validateCard()
    if (Object.keys(e2).length) { setCardErrors(e2); return }
    setIsSaving(true)
    const result = await createCard({ ...cardForm, closingDay: Number(cardForm.closingDay) })
    setIsSaving(false)
    if (result.success) { setCardModal(false); setCardForm(EMPTY_CARD_FORM) }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    await removeCard(confirmId)
    setIsDeleting(false)
    setConfirmId(null)
  }

  const handleCardChange = (field) => (e) => {
    setCardForm((prev) => ({ ...prev, [field]: e.target.value }))
    setCardErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <PageWrapper>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-900">Tarjetas de crédito</h1>
            <p className="dark:text-slate-400 text-slate-500 text-sm mt-1">Cuota total este mes: {formatCurrency(totalCardDebt)}</p>
          </div>
          <Button onClick={() => setCardModal(true)}>+ Nueva tarjeta</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState icon="💳" title="Sin tarjetas registradas" description="Agregá tus tarjetas para registrar gastos en cuotas"
            action={<Button onClick={() => setCardModal(true)}>Agregar tarjeta</Button>} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, i) => {
              const cardExp = getExpensesByCard(card.id)
              const cardTotal = cardExp.reduce((acc, e) => acc + (e.currentInstallmentAmount || 0), 0)
              return (
                <div key={card.id} onClick={() => navigate(`/credit-cards/${card.id}`)} className="group cursor-pointer">
                  <Card className="relative overflow-hidden transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-indigo-500/10">
                    <div className={`absolute inset-0 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} pointer-events-none rounded-2xl`} />
                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs dark:text-slate-400 text-slate-500">{card.type}</p>
                          <p className="dark:text-white text-slate-900 font-bold text-xl mt-0.5">{card.alias}</p>
                        </div>
                        <CloseButton
                          onClick={(e) => { e.stopPropagation(); setConfirmId(card.id) }}
                          label="Eliminar tarjeta"
                        />
                      </div>
                      <p className="dark:text-slate-400 text-slate-500 text-sm tracking-widest mb-4">•••• •••• •••• {card.lastFour}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs dark:text-slate-400 text-slate-500">Cierre día {card.closingDay || '—'}</p>
                          <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">{cardExp.length} gasto{cardExp.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs dark:text-slate-400 text-slate-500">Este mes</p>
                          <p className="text-violet-500 font-bold text-lg">{formatCurrency(cardTotal)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-1 dark:text-slate-500 text-slate-400 text-xs group-hover:text-indigo-400 transition-colors">
                        <span>Ver detalle</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        )}

        <Modal isOpen={cardModal} onClose={() => { setCardModal(false); setCardForm(EMPTY_CARD_FORM); setCardErrors({}) }} title="Nueva tarjeta">
          <form onSubmit={handleCardSubmit} noValidate className="flex flex-col gap-4">
            <Input id="alias" label="Nombre / Alias" placeholder="Ej: Visa personal" value={cardForm.alias} onChange={handleCardChange('alias')} error={cardErrors.alias} />
            <Select id="type" label="Tipo" value={cardForm.type} onChange={handleCardChange('type')}>
              {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input id="lastFour" label="Últimos 4 dígitos" placeholder="1234" maxLength={4} value={cardForm.lastFour} onChange={handleCardChange('lastFour')} error={cardErrors.lastFour} />
            <Input id="closingDay" label="Día de cierre" type="number" min="1" max="31" placeholder="Ej: 15" value={cardForm.closingDay} onChange={handleCardChange('closingDay')} error={cardErrors.closingDay} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCardModal(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" isLoading={isSaving} className="flex-1">Guardar</Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmId}
          onClose={() => setConfirmId(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="¿Eliminás esta tarjeta?"
          description="Se eliminará la tarjeta y todos sus gastos asociados."
        />
      </div>
    </PageWrapper>
  )
}

export default CreditCardsPage
