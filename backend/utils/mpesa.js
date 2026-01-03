import axios from "axios";

const baseUrl = (env) =>
  env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export const mpesaGetToken = async () => {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;

  if (!key || !secret) throw new Error("Missing MPESA_CONSUMER_KEY/SECRET in .env");

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const url = `${baseUrl(process.env.MPESA_ENV)}/oauth/v1/generate?grant_type=client_credentials`;

  try {
    const { data } = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return data.access_token;
  } catch (error) {
    console.log("❌ TOKEN ERROR STATUS:", error.response?.status);
    console.log("❌ TOKEN ERROR DATA:", error.response?.data);
    throw new Error("Failed to get M-Pesa token. Check consumer key/secret.");
  }
};

export const mpesaPasswordAndTimestamp = () => {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) throw new Error("Missing MPESA_SHORTCODE/PASSKEY in .env");

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const pass = `${shortcode}${passkey}${timestamp}`;
  const password = Buffer.from(pass).toString("base64");

  return { password, timestamp };
};

const normalizePhone = (phone) => {
  const raw = String(phone).trim().replace(/\s+/g, "");
  if (raw.startsWith("0")) return `254${raw.slice(1)}`;  // 0719... -> 254719...
  if (raw.startsWith("+")) return raw.slice(1);          // +2547... -> 2547...
  return raw;                                            // assume already 2547...
};

export const mpesaStkPush = async ({ phone, amount, accountRef, description }) => {
  const callback = process.env.MPESA_CALLBACK_URL;
  if (!callback || !callback.startsWith("https://")) {
    throw new Error("MPESA_CALLBACK_URL must be a public https URL (ngrok).");
  }

  const token = await mpesaGetToken();
  const { password, timestamp } = mpesaPasswordAndTimestamp();

  const url = `${baseUrl(process.env.MPESA_ENV)}/mpesa/stkpush/v1/processrequest`;

  const msisdn = normalizePhone(phone);
  const amt = Number(amount);

  if (!/^2547\d{8}$/.test(msisdn)) {
    throw new Error("Phone must be in format 2547XXXXXXXX");
  }
  if (!Number.isInteger(amt) || amt <= 0) {
    throw new Error("Amount must be a positive whole number (e.g. 1)");
  }

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amt,
    PartyA: msisdn,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: msisdn,
    CallBackURL: callback,
    AccountReference: String(accountRef || "Order").slice(0, 12),
    TransactionDesc: String(description || "Payment").slice(0, 13),
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
    return data;
  } catch (error) {
    console.log("❌ STK ERROR STATUS:", error.response?.status);
    console.log("❌ STK ERROR DATA:", error.response?.data);
    console.log("❌ STK ERROR REQUEST BODY:", payload);
    throw new Error(
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      "STK Push failed"
    );
  }
};
