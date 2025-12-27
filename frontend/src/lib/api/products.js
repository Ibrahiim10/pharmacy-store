import api from "./apiClient"

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params })
  return data
}
