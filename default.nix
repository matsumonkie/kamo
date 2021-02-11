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

  nodeDependencies =
    (pkgs.callPackage ./release.nix { inherit pkgs; }).shell.nodeDependencies;

  derivation =
    with pkgs; {
      name = "emojify";
      buildInputs = with pkgs; [ nodejs-14_x ];
      phases = ["unpackPhase" "buildPhase"];

      src = fetchFromGitHub {
        owner = "matsumonkie";
        repo = "bliff";
        rev = "93b7ffdbe413b42178fc06837b10b371347be771";
        sha256 = "1gxn5q0nbqh2pckz228al84ixzm189fng522zc7x0qasax4hzfnw";
      };

      # We override the install phase, as the emojify project doesn't use make
      buildPhase = ''
        #node2nix -c release.nix --nodejs-14 --development
        ln -s ${nodeDependencies}/lib/node_modules ./node_modules
        export PATH="${nodeDependencies}/bin:$PATH"
        webpack
        cp -r dist $out/
      '';
    };
in
{ b = pkgs.stdenv.mkDerivation derivation;
}
