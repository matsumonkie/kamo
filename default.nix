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

  dependencies = import (import ./nodeDependencies.nix { pkgs = pkgs;
                                                         srcPath = ./.;
                                                       }) {};
  kamo =
    pkgs.stdenv.mkDerivation {
      name = "kamo";
      buildInputs = [
        pkgs.nodejs-14_x
        pkgs.nodePackages.webpack
        pkgs.nodePackages.webpack-cli
      ];
      phases = [ "unpackPhase" "buildPhase" "installPhase" ];
      src = [
        (pkgs.lib.sourceFilesBySuffices ./source [ ".js" ".ts" ".tsx" ".css" ".pug" ])
        (builtins.path { path = ./.eslintrc.js; name = "eslintrc"; })
        ./migrations
        ./package.json
        ./package-lock.json
        ./tsconfig.json
        ./webpack.config.js
      ];

      unpackPhase = ''
        for srcFile in $src; do
          cp -r $srcFile $(stripHash $srcFile)
        done
        cp -r ${dependencies.nodeDependencies}/lib/node_modules .
      '';

      buildPhase = ''
        ${pkgs.nodejs}/bin/npx webpack
      '';

      installPhase = ''
        cp -r dist $out/
      '';
    };
in
{
  nodejs = pkgs.nodejs-14_x;
  kamo = kamo;
}
