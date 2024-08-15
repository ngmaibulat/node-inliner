function buffPromise() {
    const buff = Buffer.from(
        "data:image/png;base64,aHR0cHM6Ly9leGFtcGxlLmNvbS9pbWFnZS5wbmc=",
        "base64"
    );

    const promise = Promise.resolve(buff);
    return promise;
}

const mockFetch = (url) => {
    const promise = new Promise((resolve, reject) => {
        // Simulate handling different URLs
        if (url === "https://example.com/image.png") {
            resolve({
                buffer: buffPromise,
            });
        } else {
            reject(new Error("Not Found"));
        }
    });

    return promise;
};

const origfetch = global.fetch;
global.fetch = mockFetch;

// Usage example
fetch("https://example.com/image.png")
    .then((response) => response.buffer())
    .then((buffer) => {
        console.log("Buffer:", buffer.toString("base64"));
    })
    .catch((error) => {
        console.error("Error:", error);
    });
