// process GPT generated JSON
import * as fs from 'fs';
import * as https from 'https';
import * as jsdom from 'jsdom';

function getPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, function(res) {
            res.setEncoding('utf8');
            const data = [];

            res.on('data', function(chunk) {                                       
                data.push(Buffer.from(chunk));                                                         
            });                                                                         
        
            res.on('end', function() {       
                resolve(Buffer.concat(data).toString('utf8'));
            });     
        }).on('error', function(err) {
            reject(err);
        });
    });
}

(async () => {

    const THEME = "minecraft";

    const questions = JSON.parse(fs.readFileSync(THEME+"/source.json"));
    const output = [];
    
    let id = 1;
    for (const question of questions) {
        if (question.image === "") {
            const search = question.answer.replace(/ /g, "+");  
            const url = "https://minecraft.fandom.com/wiki/Special:Search?fulltext=1&query="+search+"&scope=internal&contentType=&ns%5B0%5D=0&ns%5B1%5D=2900&ns%5B2%5D=10000&ns%5B3%5D=10002&ns%5B4%5D=10004&ns%5B5%5D=10006";
            const searchPage = await getPage(url);

            const dom = new jsdom.JSDOM(searchPage);
            const itemPage = dom.window.document.getElementsByClassName("unified-search__result__header").item(0).children[0].href;
            const itemPageContent = await getPage(itemPage);
            const dom2 = new jsdom.JSDOM(itemPageContent);
            const underAnswer = question.answer.replace(/ /g, "_").toLowerCase();
            if (!itemPage.toLowerCase().endsWith(underAnswer)) {
                console.log(question.question);
                console.log(question.answer);
                console.log("  Item: " + itemPage);
                console.log("  Special case: " + question.answer);
                const images = dom2.window.document.getElementsByClassName("pi-image");
                if (images.length > 0) {
                    const imageLink = images.item(0).children.item(0).href;
                    console.log("    " + imageLink);
                }
                console.log("\n-------");
            } else {
                const images = dom2.window.document.getElementsByClassName("pi-image");
                if (images.length > 0) {
                    const imageLink = images.item(0).children.item(0).href;
                    question.image = imageLink;
                } else {
                    console.log(question.question);
                    console.log(question.answer);
                    console.log("  Item: " + itemPage);
                    console.log("  No images found: ");
                    console.log("\n-------");
                }
            }
            fs.writeFileSync(THEME+"/source.json", JSON.stringify(questions, null, 2));
        }
        output.push({
            id: id++,
            type: "multiple",
            difficulty: "easy",
            category: THEME,
            question: question.question,
            image: question.image,
            incorrect_answers: question.choices.filter(a => a !== question.answer),
            correct_answer: question.answer
        })
    }
    
    fs.writeFileSync(THEME+"/source.json", JSON.stringify(questions, null, 2));
    fs.writeFileSync(THEME+"/questions_en.json", JSON.stringify(output, null, 2));
})();
