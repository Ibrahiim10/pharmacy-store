import api from "@/lib/api/apiClient"

export const sendContactMessage = async (payload) => {
  const { data } = await api.post("/contact", payload)
  return data
}
