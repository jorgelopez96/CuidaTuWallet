// src/services/userService.js

const mapProfile = (row) =>
  row && {
    id: row.id,
    name: row.name,
    birthdate: row.birthdate,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }

export const getUserProfile = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return mapProfile(data)
}

// Upsert en vez de create/update separados: evita el bug de intentar
// actualizar un registro que todavía no existe (primer login).
export const upsertUserProfile = async (supabase, userId, { name, birthdate, email }) => {
  const row = { id: userId, updated_at: new Date().toISOString() }
  if (name !== undefined) row.name = name
  if (birthdate !== undefined) row.birthdate = birthdate
  if (email !== undefined) row.email = email

  const { data, error } = await supabase
    .from('profiles')
    .upsert(row)
    .select()
    .single()
  if (error) throw error
  return mapProfile(data)
}
