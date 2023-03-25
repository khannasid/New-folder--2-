const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const app = express();
const LogInCollection = require("./mongo");
const port = process.env.PORT || 3000;
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../CSSS");
console.log(publicPath);

app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.render("login");
});

//...................... here!!!!............................

app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ domain: req.body.url });
    if (check === null) {
      console.log("in Check null ! ");
      const browserFetcheer = puppeteer.createBrowserFetcher();
      let revisionInfo = await browserFetcheer.download('1095492');
      console.log("in Check null 11 ! ");
      const browser = await puppeteer.launch({
        executablePath: revisionInfo.executablePath,
          ignoreDefaultArgs: ['--disable-extensions'],
          headless: true,
          args: ['--no-sandbox', "--disabled-setupid-sandbox"]
      });
      console.log("in Check null 22 ! ");
      const page = await browser.newPage();
      await page.goto(req.body.url);
      const extractedText = await page.$eval("*", (el) => el.innerText);
      const images = await page.$$eval("img", (imgs) => {
        return imgs.map((img) => img.src);
      });
      const arr = extractedText.replace(/[\t\n\r\.\?\!]/gm, " ").split(" ");
      const count = arr.filter((word) => word !== "").length;
      const pageUrls = await page.evaluate(() => {
        const urlArray = Array.from(document.links).map((link) => link.href);
        const uniqueUrlArray = [...new Set(urlArray)];
        return uniqueUrlArray;
      });
      const data = {
        domain: req.body.url,
        wordcount: count,
        weblink: pageUrls,
        medialink: images,
      };
      console.log("inside login post!!");
      await LogInCollection.insertMany([data]);
      res.status(201).render("login", {
        domain: req.body.url,
        wordcount: count,
        weblink: pageUrls,
        medialink: images,
      });
      console.log("loging response!!!");
      console.log(data);
    } else {
      res.status(201).render("login", {
        domain: check.domain,
        wordcount: check.wordcount,
        weblink: check.weblink,
        medialink: check.medialink,
      });
    }
  } catch (e) {
    res.status(400).send("wrong details");
    console.log(e)
  }
});

app.post("/log", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ domain: req.body.url });
    console.log(check);
    if (check === null) {
      throw new Error("no Domain is present like that!");
    } else {
      console.log("inside!!");
      res.status(201).render("login", {
        domain: check.domain,
        wordcount: check.wordcount,
        weblink: check.weblink,
        medialink: check.medialink,
      });
    }
  } catch (e) {
    res.status(400).send("not found");
  }
});

app.listen(port, () => {
  console.log(`port connected at ${port}`);
});
