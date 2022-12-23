const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/summarize", async (req, res) => {
    const query = req.body.text;
    const url = `https://api.openai.com/v1/completions`;
    const prompt = `Summarize this in one paragraph: \n ${query}.`;
    const params = {
        "prompt": prompt,
        "max_tokens": 1000,
        "temperature": 0.5,
        "model": 'text-curie-001',
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