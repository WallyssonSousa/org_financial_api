import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8090;

app.get('/ping', (req, res) => {
  res.status(200).send('pong 🏓');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));