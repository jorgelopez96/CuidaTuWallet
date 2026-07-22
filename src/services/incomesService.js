// src/services/incomesService.js

const mapIncome = (row) => ({
  id: row.id,
  userId: row.user_id,
  description: row.description,
  amount: Number(row.amount),
  type: row.type,
  month: row.month,
  payDay: row.pay_day,
  expiresMonth: row.expires_month,
  isArchived: row.is_archived,
  createdAt: row.created_at,
})

// Whitelist de campos editables — ignora silenciosamente cualquier otro
// campo que el llamador todavía mande (ej. createdAt, que ahora lo pone la DB).
const toRow = (data) => {
  const row = {}
  if ('userId' in data) row.user_id = data.userId
  if ('description' in data) row.description = data.description
  if ('amount' in data) row.amount = data.amount
  if ('type' in data) row.type = data.type
  if ('month' in data) row.month = data.month
  if ('payDay' in data) row.pay_day = data.payDay ?? null
  if ('expiresMonth' in data) row.expires_month = data.expiresMonth ?? null
  if ('isArchived' in data) row.is_archived = data.isArchived
  return row
}

export const getIncomes = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(mapIncome)
}

export const addIncome = async (supabase, data) => {
  const { data: row, error } = await supabase
    .from('incomes')
    .insert(toRow(data))
    .select()
    .single()
  if (error) throw error
  return mapIncome(row)
}

export const updateIncome = async (supabase, id, data) => {
  const { data: row, error } = await supabase
    .from('incomes')
    .update(toRow(data))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapIncome(row)
}

export const archiveIncome = async (supabase, id) => {
  const { data: row, error } = await supabase
    .from('incomes')
    .update({ is_archived: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapIncome(row)
}

export const deleteIncome = async (supabase, id) => {
  const { error } = await supabase.from('incomes').delete().eq('id', id)
  if (error) throw error
  return id
}
