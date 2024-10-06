# rune-quiz-tools

A set of tools to help with building quizzes for Rune using \<https://github.com/kevglass/rune-quiz\>

All the tools below are intended to be run with a simple `node <filename>`

## duplicates.js

Remove any duplication questions. By default questions are considered duplicates if the question text and the answer text match. This is to allow for image questions such as “What block is this?” to be used multiple times with different questions.

Remember to set the theme you’re using in the code.

`node duplicates.js`

## processgpt.js

An easy way to get quiz question is to ask Chat GPT to generate them. You can both prompt it for questions and ask it to generate JSON in a specific format. You can see an example of the output I used at: \<https://github.com/kevglass/rune-quiz-tools/blob/main/minecraft/source.json\>

Once you have the questions in this format they need to be parsed into the format that the game uses. Remember to set the theme you’re using in the code.

`node processgpt.js`

## images.js

Chat GPT will generate you images for questions if you ask _very_ nicely. However, it’s easier for the game if the images are packaged along with the distributed package so the `images.js` script downloads the images and names them based on the answer. I also recommend converting images into GIFs to reduce their size - though I don’t have a script for this.

Remember to set the theme you’re using in the code.

`node images.js`

## translate.js

Rune has played all around the world. The most common languages are English, Spanish, Portuguese and Russian. The `translate.js` script will run the questions (and optionally the answers) through DeepL for translation. To use DeepL get an API key (they’re free) and place it a file named `local.json` next to the script. The JSON file has a template that looks like this:

```javascript
{
  "translate": {
    "key": "<your DeepL API key here>"
  }
}
```

Once the key is in place the `translate.js` script can be executed and it will pass every question and answer through DeepL. The script generates cache files to prevent re-translating strings when new questions are added.

Remember to set the theme you’re using in the code.

`node translate.js`

Once you have the different language JSON files and the images you can copy them over into a theme in the main `rune-quiz` project.
