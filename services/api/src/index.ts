import { createApp } from "./app.js";
import { startWisdomScheduler } from "./jobs/wisdomScheduler.js";

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

app.listen(port, () => {
  startWisdomScheduler();
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
