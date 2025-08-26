import React from "react";

/**
 * GameContext - single source of truth for game/profile state.
 * Default value includes the shape so consumers get autocompletion.
 */
export const GameContext = React.createContext({
  profile: null,                  // object | null
  setProfile: () => {},           // (profile) => void
  loadProfile: async () => null,  // (token?) => Promise<profile|null>
  clearProfile: () => {},         // () => void
  hydrated: false,                // true once we've attempted restore
  isAuthenticated: false,         // boolean shortcut
});

/**
 * Convenience hook for consumers:
 * import { useGame } from "../contexts/game-context";
 */
export function useGame() {
  return React.useContext(GameContext);
}
