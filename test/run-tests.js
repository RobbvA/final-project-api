globalThis.global = globalThis;

import { exec } from "child_process";

exec(
  'npx newman run "./postman/collections/Bookings API.json" -e "./postman/environments/Local.postman_environment.json"',
  (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Positive test failed:\n", err); // Log de error zelf
      console.error("STDERR:\n", stderr); // Log error output van Newman
      console.error("STDOUT:\n", stdout); // Log ook standaard output
      process.exit(1);
    } else {
      console.log("✅ Positive test passed:\n", stdout);

      exec(
        'npx newman run "./postman/collections/Bookings API Negative.json" -e "./postman/environments/Local.postman_environment.json"',
        (err2, stdout2, stderr2) => {
          if (err2) {
            console.error("❌ Negative test failed:\n", err2);
            console.error("STDERR:\n", stderr2);
            console.error("STDOUT:\n", stdout2);
            process.exit(1);
          } else {
            console.log("✅ Negative test passed:\n", stdout2);
          }
        }
      );
    }
  }
);
