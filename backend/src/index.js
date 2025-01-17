import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5001, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
    app.on("error", (err) => {
      console.log("Express server error", err);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });



