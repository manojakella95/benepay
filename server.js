const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, "build")));
// app.use(express.static(path.resolve('public')));

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
    // res.send(path.join(__dirname, "build", "index.html"));
});

app.listen(3002, () => console.log('website running on port 3002')); 
// Test Change
