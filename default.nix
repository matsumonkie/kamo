let
  hostPkgs = import <nixpkgs> {};
  release = hostPkgs.lib.importJSON ./release.json;
  pkgs = let
    pinnedVersion = hostPkgs.lib.importJSON ./nixpkgs-version.json;
    pinnedPkgs = hostPkgs.fetchFromGitHub {
      owner = "NixOS";
      repo = "nixpkgs";
      inherit (pinnedVersion) rev sha256;
    };
  in import pinnedPkgs {};

  nodeDependencies =
    (pkgs.callPackage ./release.nix { inherit pkgs; }).shell.nodeDependencies;

  derivation =
    with pkgs; {
      name = "bliff";
      buildInputs = with pkgs; [ nodejs-14_x ];
      phases = ["unpackPhase" "buildPhase"];

      src = fetchFromGitHub {
        inherit (release) owner repo rev sha256;
      };

      buildPhase = ''
        ln -s ${nodeDependencies}/lib/node_modules ./node_modules
        export PATH="${nodeDependencies}/bin:$PATH"
        webpack
        cp -r dist $out/
      '';
    };
in
{
  nodejs = pkgs.nodejs-14_x;
  bliff = pkgs.stdenv.mkDerivation derivation;
}
