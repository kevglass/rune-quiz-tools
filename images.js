import * as fs from 'fs';
import * as https from 'https';
import { Transform as Stream } from 'stream';

function download(url, filename, answer) {
    return new Promise((resolve, reject) => {
        https.request(url, function(response) {  
            if (response.statusCode !== 200) {   
                console.log(answer);                             
                answer = answer.replace(/ /g, "+");
                
                console.log("https://minecraft.fandom.com/wiki/Special:Search?fulltext=1&query="+answer+"&scope=internal&contentType=&ns%5B0%5D=0&ns%5B1%5D=2900&ns%5B2%5D=10000&ns%5B3%5D=10002&ns%5B4%5D=10004&ns%5B5%5D=10006");
                console.log("\n");
                resolve();
                return;
            }                                      
            const data = new Stream();   

            response.on('data', function(chunk) {                                       
                data.push(chunk);                                                         
            });                                                                         
        
            response.on('end', function() {                                             
                fs.writeFileSync(filename, data.read());  
                
                resolve();
            });                                                                         
        }).end();
    });
}

(async () => {
    const THEME = "minecraft";

    // if (fs.existsSync(THEME+"/images")) {
    //     fs.rmdirSync(THEME+"/images", { recursive: true, force: true });
    // }
    if (!fs.existsSync(THEME+"/images")) {
        fs.mkdirSync(THEME+"/images");
    }

    const questions = JSON.parse(fs.readFileSync(THEME+"/questions_en.json"));
    for (const q of questions) {
        if (q.image && q.image.startsWith("http")) {
            const elements = q.image.split("/");
            const filename = q.correct_answer+(q.image.indexOf(".png") ? ".png" : ".jpg");
            const target = THEME+"/images/"+filename
            if (!fs.existsSync(target)) {
                await download(q.image, target, q.correct_answer);
                questions.image = target;
            }
        }
    }
    // fs.writeFileSync(THEME+"/questions_en.json", JSON.stringify(questions, null, 2));
})();