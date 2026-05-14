export type ControlFallbackState = {
  keyboardSupported: boolean;
  touchSupported: boolean;
  gamepadSupported: boolean;
  connectedGamepads: number;
  fallbackLine: string;
};

export function buildControlFallbackState(input: {
  connectedGamepads: number;
  gamepadSupported: boolean;
  touchSupported: boolean;
}): ControlFallbackState {
  if (input.connectedGamepads > 0) {
    return {
      keyboardSupported: true,
      touchSupported: input.touchSupported,
      gamepadSupported: input.gamepadSupported,
      connectedGamepads: input.connectedGamepads,
      fallbackLine: `${input.connectedGamepads} GAMEPAD DETECTED  |  KEYBOARD${input.touchSupported ? " / TOUCH" : ""} READY`,
    };
  }

  return {
    keyboardSupported: true,
    touchSupported: input.touchSupported,
    gamepadSupported: input.gamepadSupported,
    connectedGamepads: 0,
    fallbackLine: input.gamepadSupported
      ? "NO GAMEPAD?  KEYBOARD / PHONE TOUCH"
      : "GAMEPAD UNAVAILABLE  |  KEYBOARD / PHONE TOUCH",
  };
}
