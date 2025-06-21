export default function handler(req, res) {
  const { roomCode, playerName } = req.body || {};

  res.status(200).json({
    success: true,
    player: playerName || "Player",
    roomCode,
    message: `Joined room ${roomCode}`
  });
}
