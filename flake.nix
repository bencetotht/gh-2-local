{
  description = "gh-2-local CLI packaged with Nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        gh2local = pkgs.callPackage ./nix/package.nix { };
      in
      {
        packages = {
          default = gh2local;
          "gh-2-local" = gh2local;
        };

        apps.default = flake-utils.lib.mkApp {
          drv = gh2local;
          exePath = "/bin/gh-2-local";
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            git
          ];
        };
      });
}
