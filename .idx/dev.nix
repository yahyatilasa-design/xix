{pkgs}: {
  channel = "stable-24.05";
  packages = [
    # Using Node.js v20 to match project dependencies in package.json
    pkgs.nodejs_20
  ];
  idx.extensions = [
    "bradlc.vscode-tailwindcss"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--hostname"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}
