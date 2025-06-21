export default function handler(req, res) {
  const { mode, weapon } = req.body || {};

  const enemies = ["Octobot", "Inkling AI", "Sniper Bot", "Roller Bot"];
  const selectedEnemies = Array(4).fill().map(() =>
    enemies[Math.floor(Math.random() * enemies.length)]
  );

  res.status(200).json({
    mode: mode || "Turf War",
    weapon,
    enemies: selectedEnemies,
    message: "AI battle ready"
  });
}
