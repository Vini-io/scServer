const express = require('express');
const app = express();

app.use(express.json()); // para receber JSON

let lastFrame = null;

app.post(
  '/upload',
  express.raw({ type: 'image/jpeg', limit: '10mb' }),
  (req, res) => {
    lastFrame = req.body;
    res.sendStatus(200);
    console.log('Frame recebido');
  }
);

app.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache'
  });

  const timer = setInterval(() => {
    if (!lastFrame) return;

    res.write(
      `--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${lastFrame.length}\r\n\r\n`
    );
    res.write(lastFrame);
    res.write('\r\n');
  }, 1000 / 15);

  req.on('close', () => clearInterval(timer));
});

let keysStore = [];

/**
 * POST /keys
 * body:
 * {
 *   "key": "F1",
 *   "value": "abrir_menu"
 * }
 */
app.post('/keys', (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'key e value são obrigatórios' });
  }

  keysStore.push({
    key,
    value,
    date: new Date()
  });

  res.json({ success: true });
});

/**
 * GET /keys
 */
app.get('/keys', (req, res) => {
  res.json(keysStore);
});




app.listen(3000, () =>
  console.log('Servidor em http://localhost:3000/stream')
);
