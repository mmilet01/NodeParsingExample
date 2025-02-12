import express from "express";

const app = express();
const port = 80;

// testing endpoints

app.get("", (_req, res) => {
  res.send(`
      <html>
        <head><title>Page One Titleee</title></head>
        <body>Contact: admin@page1.com</body>
      </html>
    `);
});

app.get("/page1", (_req, res) => {
  res.send(`
    <html>
      <head><title>Page One Title</title></head>
      <body>Contact: admin@page1.com</body>
    </html>
  `);
});

app.get("/page3", (_req, res) => {
  res.send(`
    <html>
      <head><title>Page Three Title</title></head>
      <body>No email here</body>
    </html>
  `);
});

app.get("/page5", (_req, res) => {
  res.send(`
    <html>
      <head><title>Page Five Title</title></head>
      <body>Email: support@page5.com</body>
    </html>
  `);
});

app.get("/page6", (_req, res) => {
  res.send(`
    <html>
      <head><title>Page Six Title</title></head>
      <body>Contact us at info@page6.com</body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Test server listening on http://localhost:${port}`);
});
