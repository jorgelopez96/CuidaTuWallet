// src/services/creditCardsService.js

const mapCard = (row) => ({
  id: row.id,
  userId: row.user_id,
  alias: row.alias,
  type: row.type,
  lastFour: row.last_four,
  closingDay: row.closing_day,
  createdAt: row.created_at,
})

const cardToRow = (data) => {
  const row = {}
  if ('userId' in data) row.user_id = data.userId
  if ('alias' in data) row.alias = data.alias
  if ('type' in data) row.type = data.type
  if ('lastFour' in data) row.last_four = data.lastFour
  if ('closingDay' in data) row.closing_day = data.closingDay
  return row
}

// current_installment_amount y remaining_installments son columnas
// generated always as — nunca se escriben desde acá.
const mapCardExpense = (row) => ({
  id: row.id,
  userId: row.user_id,
  cardId: row.card_id,
  description: row.description,
  totalAmount: Number(row.total_amount),
  totalInstallments: row.total_installments,
  paidInstallments: row.paid_installments,
  date: row.date,
  createdAt: row.created_at,
  currentInstallmentAmount: Number(row.current_installment_amount),
  remainingInstallments: row.remaining_installments,
})

const cardExpenseToRow = (data) => {
  const row = {}
  if ('userId' in data) row.user_id = data.userId
  if ('cardId' in data) row.card_id = data.cardId
  if ('description' in data) row.description = data.description
  if ('totalAmount' in data) row.total_amount = data.totalAmount
  if ('totalInstallments' in data) row.total_installments = data.totalInstallments
  if ('paidInstallments' in data) row.paid_installments = data.paidInstallments
  if ('date' in data) row.date = data.date
  return row
}

export const getCards = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapCard)
}

export const addCard = async (supabase, data) => {
  const { data: row, error } = await supabase
    .from('credit_cards')
    .insert(cardToRow(data))
    .select()
    .single()
  if (error) throw error
  return mapCard(row)
}

export const updateCardData = async (supabase, id, data) => {
  const { data: row, error } = await supabase
    .from('credit_cards')
    .update(cardToRow(data))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapCard(row)
}

// El on delete cascade de la FK card_expenses.card_id reemplaza el
// writeBatch manual: borrar la tarjeta borra sus gastos solo.
export const deleteCard = async (supabase, id) => {
  const { error } = await supabase.from('credit_cards').delete().eq('id', id)
  if (error) throw error
  return id
}

export const getCardExpenses = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('card_expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return data.map(mapCardExpense)
}

export const addCardExpense = async (supabase, data) => {
  const { data: row, error } = await supabase
    .from('card_expenses')
    .insert(cardExpenseToRow(data))
    .select()
    .single()
  if (error) throw error
  return mapCardExpense(row)
}

export const updateCardExpense = async (supabase, id, data) => {
  const { data: row, error } = await supabase
    .from('card_expenses')
    .update(cardExpenseToRow(data))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapCardExpense(row)
}

export const deleteCardExpense = async (supabase, id) => {
  const { error } = await supabase.from('card_expenses').delete().eq('id', id)
  if (error) throw error
  return id
}
