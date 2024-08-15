import { test } from "node:test";
import assert from "node:assert";
import inline from "./src/inline.mjs";

const content = `
<html>
<link href="assets/main.css" rel="stylesheet">
</html>
`;

const expected = `
<html>
<style>
.main{border: none;}
body{background: url(http://www.example.com/img/bg.png);/*data-inline-ignore*/}
body{background: url('http://www.example.com/img/bg.png');/*data-inline-ignore*/}
body{background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAHklEQVQoz2NgAIP/YMBAPBjVMNAa/pMISNcwEoMVAH0ls03D44ABAAAAAElFTkSuQmCC");}
body{background: url("assets/not-icon.png");/*data-inline-ignore*/}
body{background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAHklEQVQoz2NgAIP/YMBAPBjVMNAa/pMISNcwEoMVAH0ls03D44ABAAAAAElFTkSuQmCC);}
body{background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAHklEQVQoz2NgAIP/YMBAPBjVMNAa/pMISNcwEoMVAH0ls03D44ABAAAAAElFTkSuQmCC');}

</style>
</html>
`;

const { fileContent, relativeTo } = {
    fileContent: content,
    relativeTo: "cases/",
};

inline.html({ fileContent, relativeTo }, (err, result) => {
    if (err) {
        console.error(err);
    }
    assert.equal(result, expected);
});
