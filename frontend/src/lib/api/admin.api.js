import api from "./apiClient"

// products

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params })
  return data // now returns {items,page,limit,total,pages}
}


export const createProduct = async (payload) => {
  const { data } = await api.post("/products", payload)
  return data
}

export const updateProduct = async ({ id, payload }) => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`)
  return data
}

export const uploadProductImage = async ({ id, file }) => {
  const form = new FormData()
  form.append("file", file)

  const { data } = await api.post(`/products/${id}/image`, form)
  return data
}




// order
// export const fetchAllOrders = async () => {
//   const { data } = await api.get("/orders")
//   return data
// }

// export const decideOrder = async ({ orderId, action, pharmacistNote }) => {
//   const { data } = await api.put(`/orders/${orderId}/decision`, {
//     action,
//     pharmacistNote,
//   })
//   return data
// }

// export const updateOrderStatus = async ({ orderId, status }) => {
//   const { data } = await api.put(`/orders/${orderId}/status`, { status })
//   return data
// }

export const fetchAllOrders = async () => (await api.get("/orders")).data
export const decideOrder = async ({ orderId, action, pharmacistNote }) =>
  (await api.put(`/orders/${orderId}/decision`, { action, pharmacistNote })).data
export const updateOrderStatus = async ({ orderId, status }) =>
  (await api.put(`/orders/${orderId}/status`, { status })).data

export const fetchSettings = async () => {
  const { data } = await api.get("/settings")
  return data
}

export const updateSettings = async (payload) => {
  const { data } = await api.put("/settings", payload)
  return data
}


// USERS (admin)
export const fetchUsersAdmin = async (params = {}) => {
  const { data } = await api.get("/admin/users", { params })
  return data
}

export const createUserAdmin = async (payload) => {
  const { data } = await api.post("/admin/users", payload)
  return data
}

export const updateUserAdmin = async ({ id, payload }) => {
  const { data } = await api.put(`/admin/users/${id}`, payload)
  return data
}

export const deleteUserAdmin = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`)
  return data
}

export const resetUserPasswordAdmin = async ({ id, newPassword }) => {
  const { data } = await api.put(`/admin/users/${id}/reset-password`, { newPassword })
  return data
}


// Customer
export const startMpesaPayment = async ({ orderId, phone }) => {
  const { data } = await api.post(`/payments/mpesa/stk/${orderId}`, { phone })
  return data
}

// Admin list
export const fetchMpesaPayments = async (params = {}) => {
  const { data } = await api.get("/payments", { params })
  return data
}