const http = require("http");

const PORT = process.env.PORT || 3000;

let users = [
  { id: 1, name: "Leanne Graham", email: "Sincere@april.biz", phone: "1-770-736-8031 x56442" },
  { id: 2, name: "Ervin Howell", email: "Shanna@melissa.tv", phone: "010-692-6593 x09125" },
  { id: 3, name: "Clementine Bauch", email: "Nathan@yesenia.net", phone: "1-463-123-4447" },
  { id: 4, name: "Patricia Lebsack", email: "Julianne.OConner@kory.org", phone: "493-170-9623 x156" },
  { id: 5, name: "Chelsey Dietrich", email: "Lucio_Hettinger@annie.ca", phone: "(254)954-1289" },
  { id: 6, name: "Mrs. Dennis Schulist", email: "Karley_Dach@jasper.info", phone: "1-477-935-8478 x6430" },
  { id: 7, name: "Kurtis Weissnat", email: "Telly.Hoeger@billy.biz", phone: "210.067.6132" },
  { id: 8, name: "Nicholas Runolfsdottir V", email: "Sherwood@rosamond.me", phone: "586.493.6943 x140" },
  { id: 9, name: "Glenna Reichert", email: "Chaim_McDermott@dana.io", phone: "(775)976-6794 x41206" },
  { id: 10, name: "Clementina DuBuque", email: "Rey.Padberg@karina.biz", phone: "024-648-3804" }
];

let nextId = 11;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function sendNoContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large"));
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function getUserId(pathname) {
  const match = pathname.match(/^\/(?:api\/)?users\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function isUsersCollection(pathname) {
  return pathname === "/users" || pathname === "/api/users";
}

function validateUserPayload(payload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";

  if (!name || !email || !phone) {
    return { error: "name, email and phone are required" };
  }

  return { data: { name, email, phone } };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  if (method === "GET" && pathname === "/") {
    sendJson(res, 200, {
      message: "Ex3 users backend is running",
      endpoints: ["/users", "/users/:id", "/api/users", "/api/users/:id"]
    });
    return;
  }

  if (method === "GET" && pathname === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (method === "GET" && isUsersCollection(pathname)) {
    sendJson(res, 200, users);
    return;
  }

  const userId = getUserId(pathname);

  if (method === "GET" && userId !== null) {
    const user = users.find(item => item.id === userId);
    sendJson(res, user ? 200 : 404, user || { error: "User not found" });
    return;
  }

  if (method === "POST" && isUsersCollection(pathname)) {
    try {
      const validation = validateUserPayload(await readBody(req));

      if (validation.error) {
        sendJson(res, 400, { error: validation.error });
        return;
      }

      const createdUser = { id: nextId++, ...validation.data };
      users.push(createdUser);
      sendJson(res, 201, createdUser);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if ((method === "PUT" || method === "PATCH") && userId !== null) {
    const userIndex = users.findIndex(item => item.id === userId);

    if (userIndex === -1) {
      sendJson(res, 404, { error: "User not found" });
      return;
    }

    try {
      const validation = validateUserPayload(await readBody(req));

      if (validation.error) {
        sendJson(res, 400, { error: validation.error });
        return;
      }

      users[userIndex] = { ...users[userIndex], ...validation.data };
      sendJson(res, 200, users[userIndex]);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (method === "DELETE" && userId !== null) {
    const userExists = users.some(item => item.id === userId);

    if (!userExists) {
      sendJson(res, 404, { error: "User not found" });
      return;
    }

    users = users.filter(item => item.id !== userId);
    sendNoContent(res);
    return;
  }

  sendJson(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Ex3 users backend is running on port ${PORT}`);
});
