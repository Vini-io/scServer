const express = require('express');
const app = express();

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
  }, 1000);  

  req.on('close', () => clearInterval(timer));
});

app.listen(3000, () =>
  console.log('Servidor em http://localhost:3000/stream')
);
