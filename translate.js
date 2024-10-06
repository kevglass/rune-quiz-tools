import * as fs from 'fs';
import * as https from 'https';

const THEME = "minecraft";
const TRANSLATE_ANSWERS = true;
const translationKey2 = JSON.parse(fs.readFileSync("local.json").toString()).translate.key;

function deepTranslate(lang, text) {
    return new Promise((resolve) => {
        const body = "source_lang=EN&target_lang=" + lang.toUpperCase() + "&tag_handling=xml&ignore_tags=var&text=" + encodeURIComponent(text);
        const options = {
            hostname: "api-free.deepl.com",
            //hostname: "api.deepl.com",
            port: 443,
            path: "/v2/translate",
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
                'Authorization': "DeepL-Auth-Key " + translationKey2
            }
        }
        const req = https.request(options, res => {
            let chunks = [];

            res.on('error', (e) => {
                console.error("Failed to complete post request for translate");
                console.error(e);
                resolve();
            });

            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            res.on('end', () => {
                let body = Buffer.concat(chunks);
                const result = JSON.parse(body.toString());
                if (result.error) {
                    console.log("Error translating: " + text);
                    process.exit();
                } else {
                    if (!result.translations) {
                        console.log("Could not translate: " + text);
                        console.log(JSON.stringify(result, null, 2));
                    }
                    let translation = result.translations[0].text;
                    resolve(translation);
                }
            });
        });

        req.on('error', (e) => {
            console.log();
            console.log("Connection error on: " + text);
            resolve();
        });
        req.write(body);
        req.end();
    });
}

async function generateLanguage(lang, questions) {
    const cache = fs.existsSync(THEME+"/"+lang+".cache") ? JSON.parse(fs.readFileSync(THEME+"/"+lang+".cache")) : {};
    const translatedQuestions = fs.existsSync(THEME+"/"+"questions_"+lang+".json") ? JSON.parse(fs.readFileSync(THEME+"/"+"questions_"+lang+".json")) : []

    for (const question of questions) {
        // checks for untranslated answers
        // const existingTranslated = translatedQuestions.find(q => q.id === question.id);
        // if (!existingTranslated) {
        //     console.log("ID: " + question.id + " doesn't exist in : " + lang);
        // } else {
        //     if (question.correct_answer === existingTranslated.correct_answer) {
        //         console.log(question.correct_answer);
        //     }
        //     for (let i=0;i<question.incorrect_answers.length;i++) {
        //         if (question.incorrect_answers[i] === existingTranslated.incorrect_answers[i]) {
        //             console.log(question.correct_answer);
        //         }
        //     }
        // }

        if (!cache[question.question+"-"+question.correct_answer]) {
            console.log(lang+": "+ question.question);
            const translated = { ...question };
            translated.incorrect_answers = [...translated.incorrect_answers];
            
            translated.question = await deepTranslate(lang, question.question);

            if (TRANSLATE_ANSWERS) {
                translated.correct_answer = await deepTranslate(lang, question.correct_answer.toLowerCase());
                for (let i=0;i<question.incorrect_answers.length;i++) {
                    translated.incorrect_answers[i] = await deepTranslate(lang, question.incorrect_answers[i].toLowerCase());
                }
            }

            translatedQuestions.push(translated);
            cache[question.question+"-"+question.correct_answer] = translated;

            fs.writeFileSync(THEME+"/"+lang+".cache", JSON.stringify(cache, null, 2));
            fs.writeFileSync(THEME+"/"+"questions_"+lang+".json", JSON.stringify(translatedQuestions, null, 2));
        }
    }
}

(async () => {
    const questions = JSON.parse(fs.readFileSync(THEME+"/questions_en.json").toString());
    await generateLanguage("ru", questions);
    await generateLanguage("pt", questions);
    await generateLanguage("es", questions);
    const ru = JSON.parse(fs.readFileSync(THEME+"/questions_en.json").toString())
    console.log(questions.filter(q => q.image).length + " vs " + ru.filter(q => q.image).length);
})();