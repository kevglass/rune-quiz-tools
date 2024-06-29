import * as fs from 'fs';

const THEME = "general";

function processLang(lang) {
    const questions = JSON.parse(fs.readFileSync(THEME+"/questions_"+lang+".json"));
    let id = 1;
    for (const question of questions) {
        question.id = id;
        id++;
    }
    console.log("Writing", lang);
    fs.writeFileSync(THEME+"/questions_"+lang+".json", JSON.stringify(questions, null, 2));
}

processLang("en");
processLang("es");
processLang("ru");
processLang("pt");
