import path from "path";
import fs from "fs";
import mime from "mime-types";
import { http, HttpResponse } from "msw";
import { baseUrl } from "./baseurl.mjs";

export const handlers = [
    http.get(`${baseUrl}/user`, () => {
        const output = {
            id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
            firstName: "John",
            lastName: "Maverick",
        };

        return HttpResponse.json(output);
    }),

    http.get(`${baseUrl}/old`, () => {
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/new",
            },
        });
    }),

    http.get("https://raw.githubusercontent.com/not-a-file.css", () => {
        const resp = new Response(null, {
            status: 400,
        });

        return resp;
    }),

    http.get(`${baseUrl}/200.html`, ({ request, params }) => {
        const body = "This is a 200 response";

        const resp = new Response(body, {
            status: 200,
            headers: {
                "X-Some-Header": "some-value",
            },
        });

        return resp;
    }),

    http.get(`${baseUrl}/404.html`, ({ request, params }) => {
        const url = new URL(request.url);
        const relativePath = url.pathname.slice(1);

        const filePath = path.join("cases", relativePath);
        const fileExists = fs.existsSync(filePath);

        if (fileExists) {
            const body = fs.readFileSync(filePath);

            const resp = new Response(body, {
                status: 404,
                headers: {
                    "X-Some-Header": relativePath,
                },
            });

            return resp;
        } else {
            const resp = new Response(null, {
                status: 404,
                headers: {
                    "X-Some-Header": "some-value",
                },
            });

            return resp;
        }
    }),

    http.get(`*`, ({ request, params }) => {
        const url = new URL(request.url);
        const relativePath = url.pathname.slice(1);

        const filePath = path.join("cases", relativePath);
        const fileExists = fs.existsSync(filePath);

        if (!fileExists) {
            const resp = new Response(null, {
                status: 404,
            });

            return resp;
        }

        const body = fs.readFileSync(filePath);
        const ctype = mime.contentType(path.extname(relativePath));
        const contentType = ctype || "application/octet-stream";

        const resp = new Response(body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "X-Some-Header": relativePath,
            },
        });

        return resp;
    }),
];
