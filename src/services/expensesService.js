// src/services/expensesService.js

const mapExpense = (row) => ({
  id: row.id,
  userId: row.user_id,
  description: row.description,
  amount: Number(row.amount),
  category: row.category,
  date: row.date,
  createdAt: row.created_at,
})

const toRow = (data) => {
  const row = {}
  if ('userId' in data) row.user_id = data.userId
  if ('description' in data) row.description = data.description
  if ('amount' in data) row.amount = data.amount
  if ('category' in data) row.category = data.category
  if ('date' in data) row.date = data.date
  return row
}

export const getExpenses = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return data.map(mapExpense)
}

export const addExpense = async (supabase, data) => {
  const { data: row, error } = await supabase
    .from('expenses')
    .insert(toRow(data))
    .select()
    .single()
  if (error) throw error
  return mapExpense(row)
}

export const updateExpense = async (supabase, id, data) => {
  const { data: row, error } = await supabase
    .from('expenses')
    .update(toRow(data))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapExpense(row)
}

export const deleteExpense = async (supabase, id) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
  return id
}
