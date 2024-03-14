{
  config ? {},
  overlays ? [],
  sources ? import ./sources.nix,
  system ? builtins.currentSystem
}:
let
  pkgsConfig = { allowUnfree = true; } // config;
  allOverlays = [
    (self: super: { inherit sources; })
    (self: super: { nodejs = self.nodejs-18_x; })
  ] ++ overlays;
in
  (import sources.nixpkgs) {
    inherit system;
    config = pkgsConfig;
    overlays = allOverlays;
  }

