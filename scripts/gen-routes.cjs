const path = require("node:path");
const { Generator, getConfig } = require("@tanstack/router-generator");

const root = process.cwd();
const config = getConfig({}, root);
const logger = require("@tanstack/router-generator/dist/cjs/logger.cjs");
const generator = new Generator({
  config,
  root,
  logger: logger.logging({ disabled: false }),
});

generator
  .run({})
  .then((res) => {
    if (res && res.rerun) {
      console.log("rerun requested");
    } else {
      console.log("OK route tree generated");
    }
  })
  .catch((e) => {
    console.error("ERR", e);
    process.exit(1);
  });
