const fs = require('fs');
const { execSync, spawn } = require('child_process');

const port = process.env.PORT || 3000;
const uuid = process.env.UUID || '24564b18-49dc-46c5-9271-9c6bc7686523';

const conf = {
  inbounds: [{
    port: parseInt(port),
    protocol: "vless",
    settings: {
      clients: [{ id: uuid }],
      decryption: "none"
    },
    streamSettings: {
      network: "ws",
      wsSettings: { path: "/ws" }
    }
  }],
  outbounds: [{ protocol: "freedom" }]
};

fs.writeFileSync('c.json', JSON.stringify(conf));

try {
  execSync('curl -L -o x.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip');
  execSync('unzip -qo x.zip xray -d . && chmod +x ./xray');
  
  const child = spawn('./xray', ['-c', 'c.json']);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
} catch (e) {
  console.error("Init failed:", e.message);
}
