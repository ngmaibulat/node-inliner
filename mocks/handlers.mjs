import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("https://example.com/user", () => {
        const output = {
            id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d",
            firstName: "John",
            lastName: "Maverick",
        };

        return HttpResponse.json(output);
    }),

    http.get("/old", () => {
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/new",
            },
        });
    }),
];
