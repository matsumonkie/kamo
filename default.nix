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

  eslintrc = builtins.path { path = ./.eslintrc.js;
                             name = "eslintrc";
                           };

  srcs = pkgs.lib.sourceFilesBySuffices ./source [ ".js" ".ts" ".tsx" ".css" ".pug" ];

  nodeDependencies =
    (pkgs.callPackage ./release.nix { inherit pkgs; }).shell.nodeDependencies;

  derivation =
    with pkgs; {
      name = "kamo";
      buildInputs = with pkgs; [ nodejs-14_x ];
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
      '';

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
  kamo = pkgs.stdenv.mkDerivation derivation;
}
