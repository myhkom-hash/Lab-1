import { app } from "./app";
import { migrate } from "./db/migrate";
async function bootstrap() {
await migrate();
app.listen(3000, () => console.log("Server started"));
}
bootstrap().catch((e) => {
console.error(e);
process.exit(1);

});
