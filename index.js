const express = require("express");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const helper = require("./helper");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Working");
});

function readCSVSync(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const rows = fileContent.trim().split("\n");
  const comma = ",";
  const data = {};

  for (const row of rows) {
    const values = row.split(comma);

    if (values.length > 2) {
      let frenchWord = "";
      values.forEach((value, index) => {
        if (index == 1 || index == values.length - 1)
          value = value.replace('"', "");
        if (index != 0 && index != values.length - 1) value += comma;
        frenchWord += value;
      });
      data[values[0]] = frenchWord;
    } else {
      data[values[0]] = values[1];
    }
  }
  return data;
}

app.post("/api/uploadFiles", upload.array("files"), async (req, res) => {
  try {
    const startTime = process.hrtime();
    const startMemoryUsage = process.memoryUsage().heapUsed;

    let findWords, list, dictionary;
    let wordOccurrences = "English Word,French Word,Frequency\n";

    req.files.forEach((file) => {
      if (file.originalname === "french_dictionary.csv") {
        dictionary = readCSVSync(file.path);
      } else if (file.originalname === "t8.shakespeare.txt") {
        list = fs.readFileSync(file.path, "utf8");
      } else {
        findWords = fs.readFileSync(file.path, "utf8").split("\n");
      }
    });

    findWords.forEach((word) => {
      let count = 0;
      let replacementWord = dictionary[word];

      const regex = new RegExp(`\\b${word}\\b`, "gi");

      list = list.replace(regex, (match) => {
        count++;
        if (match === match.toUpperCase()) {
          return replacementWord.toUpperCase();
        } else if (match[0] === match[0].toUpperCase()) {
          replacementWord =
            replacementWord.charAt(0).toUpperCase() + replacementWord.slice(1);
          return replacementWord;
        } else {
          return replacementWord;
        }
      });
      wordOccurrences += word + "," + `${replacementWord}` + "," + count + "\n";
    });

    const files = [
      { name: "t8.shakespeare.translated.txt", content: list },
      { name: "frequency.csv", content: wordOccurrences },
    ];

    files.forEach((file) => {
      fs.writeFileSync(file.name, file.content, "utf8");
    });
    const endTime = process.hrtime(startTime);
    const timeTaken = helper.calculateTimeTaken(endTime);

    const endMemoryUsage = process.memoryUsage().heapUsed;
    const memoryTaken = helper.calculateMemoryTaken(
      startMemoryUsage,
      endMemoryUsage
    );

    fs.writeFileSync("performance.txt", timeTaken + memoryTaken, "utf8");
    return res.send("Success");
  } catch (err) {
    return res.send({ err: err });
  }
});

app.listen(3002, () => {
  console.log("Listening");
});
