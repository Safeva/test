const username = process.env.WEB_USERNAME || "admin2023";
const password = process.env.WEB_PASSWORD || "password2023";
const url = "https://" + process.env.PROJECT_DOMAIN + ".b4a.run";
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");
const auth = require("basic-auth");


app.use((req, res, next) => {
  const user = auth(req);
  if (user && user.name === username && user.pass === password) {
    return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Node"');
  return res.status(401).send();
});


app.get("/", function (req, res) {
  res.status(404).send("404 page not found");
});


app.get("/status2", function (req, res) {
  let cmdStr =
    "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>err：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>ok：\n" + stdout + "</pre>");
    }
  });
});


app.get("/listen2", function (req, res) {
  let cmdStr = "ss -nltp";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>err：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>ok：\n" + stdout + "</pre>");
    }
  });
});


app.get("/list2", function (req, res) {
  let cmdStr = "cat list";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>err：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>ok：\n\n" + stdout + "</pre>");
    }
  });
});


app.get("/info2", function (req, res) {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("err：" + err);
    } else {
      res.send(
        "ok：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});


app.get("/test2", function (req, res) {
  fs.writeFile("./test.txt", "ok", function (err) {
    if (err) {
      res.send("ok" + err);
    } else {
      res.send("ok");
    }
  });
});


app.get("/root2", function (req, res) {
  let cmdStr = "bash root.sh >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("ok" + err);
    } else {
      res.send("ok" + "ok");
    }
  });
});

// keepalive begin

function keep_web_alive() {

  exec("curl -m5 " + url, function (err, stdout, stderr) {
    if (err) {
      console.log("ok" + err);
    } else {
      console.log("ok" + stdout);
    }
  });

  exec("pgrep -laf apache.js", function (err, stdout, stderr) {

    if (stdout.includes("./apache.js -c ./config.json")) {
      console.log("web ok");
    } else {

      exec(
        "chmod +x apache.js && ./apache.js -c ./config.json >/dev/null 2>&1 &",
        function (err, stdout, stderr) {
          if (err) {
            console.log("ok" + err);
          } else {
            console.log("ok");
          }
        }
      );
    }
  });
}
setInterval(keep_web_alive, 10 * 1000);


function keep_argo_alive() {
  exec("pgrep -laf cloudflared", function (err, stdout, stderr) {

    if (stdout.includes("./cloudflared tunnel")) {
      console.log("ok");
    } else {

      exec("bash argo.sh 2>&1 &", function (err, stdout, stderr) {
        if (err) {
          console.log("ok" + err);
        } else {
          console.log("ok");
        }
      });
    }
  });
}
setInterval(keep_argo_alive, 30 * 1000);



app.get("/download", function (req, res) {
  download_web((err) => {
    if (err) {
      res.send("ok");
    } else {
      res.send("ok");
    }
  });
});

app.use(
  "/",
  createProxyMiddleware({
    changeOrigin: true, 
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
    pathRewrite: {
      // ok/
      "^/": "/",
    },
    target: "http://127.0.0.1:8080/", 
    ws: true, 
  })
);


function download_web(callback) {
  let fileName = "apache.js";
  let web_url =
    "https://github.com/Cianameo/amd-no-conf/raw/main/apache.js";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) {
        callback("ok");
      } else {
        callback(null);
      }
    });
}

download_web((err) => {
  if (err) {
    console.log("ok");
  } else {
    console.log("ok");
  }
});


exec("bash entrypoint.sh", function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));
