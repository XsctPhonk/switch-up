export default function handler(req, res) {
  const { hostName, weapon } = req.body || {};

  const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

  res.status(200).json({
    roomCode,
    host: hostName || "Anonymous",
    weapon,
    createdAt: Date.now()
  });
}
