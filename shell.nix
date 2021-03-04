let
  pkgs = let
    hostPkgs = import <nixpkgs> {};
    pinnedVersion = hostPkgs.lib.importJSON ./nixpkgs-version.json;
    pinnedPkgs = hostPkgs.fetchFromGitHub {
      owner = "NixOS";
      repo = "nixpkgs";
      inherit (pinnedVersion) rev sha256;
    };
  in import pinnedPkgs {};

in pkgs.mkShell {
  name = "kamo";
  buildInputs = with pkgs; [
    nodejs
  ];
}
