import Phaser from "phaser";
import { MoroccanArenaScene } from "./game/MoroccanArenaScene";
import "./style.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: "app",
  width: 1024,
  height: 576,
  backgroundColor: "#163936",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MoroccanArenaScene],
};

new Phaser.Game(config);
