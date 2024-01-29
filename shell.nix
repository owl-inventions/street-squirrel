let
  nixpkgs = builtins.fetchTarball {
    url    = "https://github.com/NixOS/nixpkgs/archive/refs/tags/23.11.tar.gz";
    sha256 = "bc9a0a74e8d7fb0e11434dd3abaa0cb0572ccd3a65b5a192eea41832b286e8a0";
  };

  pkgs = import nixpkgs { };

in
  pkgs.mkShell {
    buildInputs = [
      pkgs.pre-commit
      pkgs.nodejs-18_x
      pkgs.mkcert
      pkgs.bun
    ];
  }
