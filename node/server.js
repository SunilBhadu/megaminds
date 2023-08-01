const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000; 

app.use(bodyParser.json());
app.use(cors());

app.get('/api/data', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err);
      return res.status(500).json({ error: 'Unable to fetch data' });
    }

    try {
      const jsonData = JSON.parse(data);
      const dataArray = jsonData.data;
      res.json(dataArray);
    } catch (err) {
      console.error('Error parsing JSON data:', err);
      res.status(500).json({ error: 'Invalid data format' });
    }
  });
});

app.put('/api/data/:samplingTime', (req, res) => {
  const samplingTime = req.params.samplingTime;
  const newData = req.body;

  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err);
      return res.status(500).json({ error: 'Unable to fetch data' });
    }

    try {
      const jsonData = JSON.parse(data);
      const dataArray = jsonData.data;

      let found = false;
      const updatedDataArray = dataArray.map((item) => {
        if (item.SamplingTime === samplingTime) {
          found = true;
          return { ...item, ...newData };
        }
        return item;
      });

      if (!found) {
        return res.status(404).json({ error: 'Object with the specified sampling time not found' });
      }

      jsonData.data = updatedDataArray;

      fs.writeFile('./db.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing db.json:', err);
          return res.status(500).json({ error: 'Unable to update data' });
        }
        res.json({ message: 'Data updated successfully' });
      });
    } catch (err) {
      console.error('Error parsing JSON data:', err);
      res.status(500).json({ error: 'Invalid data format' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
