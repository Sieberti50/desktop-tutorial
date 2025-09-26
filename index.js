const express = require('express');
const app = express();
const port = 3000;

app.get('/',(req, res)=>{
    res.send("dziala")
})

app.listen(port, ()=>{
    console.log('nie dziala'+port)
})
