const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

try{
    const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
        const image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const textData = {
            text: text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        };

        image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);
        console.log('Succes')
        startApp()  
    }
}    
catch(error) {
    console.log(error); // if there's an error, we catch it and show it in console
}

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  await image.quality(100).writeAsync(outputFile);
  console.log('Succes')
  startApp()
};

const prepareOutputFilename = (filename) => {
  const [ name, ext ] = filename.split('.');
  return `${name}-with-watermark.${ext}`;
};

const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([{
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }]);

  // if answer is no, just quit the app
  if(!answer.start) process.exit();

  // ask about input file and watermark type
  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpeg',
  }, {
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);

//

  if(options.watermarkType === 'Text watermark') {

    if (fs.existsSync('./img/' + options.inputImage)) {

        const text = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
        }])
        options.watermarkText = text.value;
        addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText);
        
    } else {
        console.error('Something went wrong, try again');
    }
  }

//

  else {

    if (fs.existsSync('./img/' + options.inputImage) && './img/' + options.watermarkImage) {

        const image = await inquirer.prompt([{
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'logo.png',
        }])
        options.watermarkImage = image.filename;
        addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage);
    } else {
    console.error('Something went wrong, try again');
    }
}
}

startApp();
