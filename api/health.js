export default function handler(req, res) {
  res.status(200).json({ status: "UP", message: "Vercel serverless is working!" });
}
