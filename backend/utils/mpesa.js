import axios from "axios"

const baseUrl = (env) =>
  env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke"

export const mpesaGetToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64")

  const url = `${baseUrl(process.env.MPESA_ENV)}/oauth/v1/generate?grant_type=client_credentials`
  const { data } = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` },
  })

  return data.access_token
}

export const mpesaPasswordAndTimestamp = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14)

  const pass = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  const password = Buffer.from(pass).toString("base64")

  return { password, timestamp }
}

export const mpesaStkPush = async ({ phone, amount, accountRef, description }) => {
  const token = await mpesaGetToken()
  const { password, timestamp } = mpesaPasswordAndTimestamp()

  const url = `${baseUrl(process.env.MPESA_ENV)}/mpesa/stkpush/v1/processrequest`

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: accountRef,
    TransactionDesc: description,
  }

  const { data } = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })

  return data
}
