const fs = require('fs');
const net = require('net');
const http = require('http');
const { execSync, spawn } = require('child_process');

const p = process.env.PORT || 3000;
const u = process.env.UUID || '24564b18-49dc-46c5-9271-9c6bc7686523';
const xp = 3001;

const c = {
  inbounds: [{
    port: xp,
    listen: "127.0.0.1",
    protocol: "vless",
    settings: { clients: [{ id: u }], decryption: "none" },
    streamSettings: { network: "ws", wsSettings: { path: "/ws" } }
  }],
  outbounds: [{ protocol: "freedom" }]
};

fs.writeFileSync('c.json', JSON.stringify(c));

try {
  if (!fs.existsSync('./xray')) {
    execSync('curl -sL -o x.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip');
    execSync('unzip -qo x.zip xray -d . && chmod +x ./xray && rm x.zip');
  }
  spawn('./xray', ['-c', 'c.json']);
} catch (e) {}

const s = http.createServer((req, res) => {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<html><head><title>404 Not Found</title></head><body><center><h1>404 Not Found</h1></center><hr><center>nginx</center></body></html>');
});

s.on('upgrade', (req, sock, head) => {
  if (req.url === '/ws') {
    const px = net.createConnection(xp, '127.0.0.1', () => {
      px.write(head);
      sock.pipe(px).pipe(sock);
    });
    px.on('error', () => sock.destroy());
  } else {
    sock.destroy();
  }
});

s.listen(p, '0.0.0.0');
