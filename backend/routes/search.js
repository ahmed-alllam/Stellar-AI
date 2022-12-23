// make an express route for search
// the function should take in a query string
// the function should return a json object with the search results
// the results are coming from the Open AI API for GPT-3

const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/search", async (req, res) => {
    const query = req.query.q;
    const url = `https://api.openai.com/v1/completions`;
    const prompt = `What is ${query}.`;
    const params = {
        "prompt": prompt,
        "max_tokens": 200,
        "temperature": 0.7,
        "model": 'text-davinci-003',
        "frequency_penalty": 0,
        "presence_penalty": 0,
    };

    const headers = {
        'Authorization': `Bearer ` + process.env.OPENAI_SECRET_KEY,
    };

    try {
        const response = await axios.post(url, params, { headers: headers });
        console.log(response.data);
        output = `${response.data.choices[0].text}`;
        res.send(output);
        console.log(output);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;