const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cheerio = require("cheerio");
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/parse", (req, res) => {
  try {
    const $ = cheerio.load(req.body.source);

    const lessons = {};

    $(".spreadsheet tr").each(function () {
      if (!$(this).hasClass("columnTitles")) {
        const cells = $(this).children();
        const name = cells.eq(0);
        const link = cells.eq(6);
        const start = cells.eq(7);
        const end = cells.eq(8);
        if (link.children().first().attr("href")) {
          lessons[name.text().split(" [")[0]] = link
            .children()
            .first()
            .attr("href");
        }
      }
    });
    return res.status(200).json(lessons);
  } catch (e) {
    return res.status(500).send(e);
  }
});

app.listen(port, () => console.log(`App is listening on port ${port}`));
