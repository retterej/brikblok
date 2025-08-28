import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const {
  BL_CONSUMER_KEY,
  BL_CONSUMER_SECRET,
  BL_TOKEN,
  BL_TOKEN_SECRET,
} = process.env;

if (!BL_CONSUMER_KEY || !BL_CONSUMER_SECRET || !BL_TOKEN || !BL_TOKEN_SECRET) {
  console.error("Missing BrickLink credentials. Set BL_CONSUMER_KEY, BL_CONSUMER_SECRET, BL_TOKEN, BL_TOKEN_SECRET in .env");
  process.exit(1);
}

const baseUrl = "https://api.bricklink.com/api/store/v1";

function encode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function normalizeUrl(url) {
  const u = new URL(url);
  const port = ((u.protocol === "http:" && u.port === "80") || (u.protocol === "https:" && u.port === "443") || u.port === "") ? "" : `:${u.port}`;
  return `${u.protocol}//${u.hostname}${port}${u.pathname}`;
}

function buildSignatureBaseString(method, url, params) {
  const normalizedParams = Object.keys(params)
    .sort()
    .map((k) => `${encode(k)}=${encode(params[k])}`)
    .join("&");

  return [method.toUpperCase(), encode(normalizeUrl(url)), encode(normalizedParams)].join("&");
}

function buildAuthHeader(params) {
  const header = "OAuth " + Object.keys(params).sort().map((k) => `${encode(k)}="${encode(params[k])}"`).join(", ");
  return header;
}

function authorize({ url, method, queryParams = {} }) {
  const oauthParams = {
    oauth_consumer_key: BL_CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: BL_TOKEN,
    oauth_version: "1.0",
  };

  // Only include query + OAuth params in the signature (not JSON body)
  const signatureBaseString = buildSignatureBaseString(method, url, { ...queryParams, ...oauthParams });
  const signingKey = `${encode(BL_CONSUMER_SECRET)}&${encode(BL_TOKEN_SECRET)}`;
  const oauth_signature = crypto.createHmac("sha1", signingKey).update(signatureBaseString).digest("base64");

  return { ...oauthParams, oauth_signature };
}

export async function blRequest(method, endpoint, { query = {}, body = null } = {}) {
  const url = new URL(baseUrl + endpoint);
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));

  const oauthParams = authorize({ url: url.toString(), method, queryParams: Object.fromEntries(url.searchParams.entries()) });
  const headers = {
    Authorization: buildAuthHeader(oauthParams),
    "Content-Type": "application/json",
  };

  const config = { method, url: url.toString(), headers, validateStatus: () => true };
  if (body != null) config.data = body;

  const res = await axios(config);
  if (res.status === 429) throw new Error("Rate limited (HTTP 429)");
  if (res.status >= 400) throw new Error(`BrickLink error ${res.status}: ${JSON.stringify(res.data)}`);
  return res.data;
}
