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

  node2NixFiles = srcPath:
    pkgs.stdenv.mkDerivation {
      name = "node2NixFiles";
      nativeBuildInputs = [ pkgs.nodejs pkgs.nodePackages.node2nix ];
      src = srcPath;
      phases = [ "unpackPhase" "buildPhase" "installPhase" ];
      unpackPhase = ''
        cp $src/package.json $src/package-lock.json .
      '';
      buildPhase = ''
        node2nix --lock package-lock.json --development
      '';
      installPhase = ''
        mkdir $out
        cp node-env.nix node-packages.nix default.nix $out/
        cp package.json package-lock.json $out/
      '';
    };

  dependencies = import (node2NixFiles ./.) { inherit pkgs; };

  eslintrc = builtins.path { path = ./.eslintrc.js;
                             name = "eslintrc";
                           };

  srcs = pkgs.lib.sourceFilesBySuffices ./source [ ".js" ".ts" ".tsx" ".css" ".pug" ];

  derivation =
    with pkgs; {
      name = "kamo";
      buildInputs = [
        pkgs.nodejs-14_x
        pkgs.nodePackages.webpack
        pkgs.nodePackages.webpack-cli
      ];
      phases = ["unpackPhase" "buildPhase"];
      src = [
        eslintrc
        srcs
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
        echo 12
        ls node_modules/webpack
        ${nodejs}/bin/npx webpack
        cp -r dist $out/
      '';
    };
in
{
  nodejs = pkgs.nodejs-14_x;
  kamo = pkgs.stdenv.mkDerivation derivation;
}
