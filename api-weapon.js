export default function handler(_, res) {
  const weapons = [
    { name: "Decavitator", sub: "Burst Bomb", special: "Zipcaster" },
    { name: "Aero Spray", sub: "Suction Bomb", special: "Booyah Bomb" },
    { name: "N-Zap", sub: "Autobomb", special: "Tacticooler" },
    { name: "Slosher", sub: "Torpedo", special: "Triple Inkstrike" },
    { name: "E-liter 4K", sub: "Ink Mine", special: "Wave Breaker" },
    { name: "Dualies", sub: "Burst Bomb", special: "Crab Tank" },
    { name: "Heavy Splatling", sub: "Sprinkler", special: "Ink Storm" }
  ];

  res.status(200).json(weapons);
}
