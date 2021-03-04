{ pkgs, srcPath } :

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
}
