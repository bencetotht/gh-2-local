{ lib
, buildNpmPackage
, importNpmLock
, makeWrapper
, git
, nodejs_20
, pkg-config
, python3
, sqlite
}:

buildNpmPackage rec {
  pname = "gh-2-local";
  version = "0.1.0";

  src = lib.cleanSource ../.;
  nodejs = nodejs_20;

  npmDeps = importNpmLock {
    npmRoot = ../.;
  };
  npmConfigHook = importNpmLock.npmConfigHook;

  npmBuildScript = "build";

  nativeBuildInputs = [
    makeWrapper
    pkg-config
    python3
  ];

  buildInputs = [ sqlite ];

  postInstall = ''
    wrapProgram $out/bin/gh-2-local \
      --prefix PATH : ${lib.makeBinPath [ git ]}
  '';

  meta = {
    description = "CLI to sync and pull GitHub repositories into local storage";
    homepage = "https://github.com";
    license = lib.licenses.mit;
    mainProgram = "gh-2-local";
    platforms = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];
  };
}
