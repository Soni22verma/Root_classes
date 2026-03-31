import app from './App.js'
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});