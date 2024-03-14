{
  pkgs ? import ./nix/pkgs.nix {}
}:
let
in pkgs.mkShell {
  buildInputs = with pkgs; [
    yarn
    nodejs
  ];
}