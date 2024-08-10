import { server } from "./node.mjs";

console.log(process.env.MSW_ENABLED);

//enable mock conditionally
//load env via: node --env-file=dev.env mocks/index.mjs
if (process.env.MSW_ENABLED) {
    server.listen();
}

async function app() {
    const response = await fetch("https://example.com/user");
    const user = await response.json();
    console.log(user);
}

app();
