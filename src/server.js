const path = require('path');
const express = require('express');
const folderRoutes = require('./routes/folderRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/folders', folderRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
