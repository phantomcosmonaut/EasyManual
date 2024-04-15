import fsPromises from 'fs/promises';
import fs from 'fs';
import Tags from './RegexPatterns.js';
import pagedown from 'pagedown';
import nunjucks from 'nunjucks';
import path from 'path';

const extension = '.em.md'

/**
 * @typedef {Object} Manual
 * @property {string} category
 * @property {string} name
 * @property {string} html
*/

/**
 * @param {string} filename
 * @returns {Promise<Manual>}
*/
const parseManual = async (filename) => {
    let text = await fsPromises.readFile(filename,{ encoding: 'utf8' });
    const category = Tags.category.exec(text);
    text = text.replace(Tags.category,'');
    const name = Tags.name.exec(text);
    text = text.replace(Tags.name,'');
    const refs = Tags.name.exec(text);

    const converter = new pagedown.getSanitizingConverter();
    const html = converter.makeHtml(text);

    return {
        category,
        name,
        html
    }
};

/**
 * @param {string} directory
*/
const getPages = async (directory) => {
    if (!fs.existsSync(directory)) {
        console.log("Directory not found: ",directory);
        return;
    }

    const files = await fsPromises.readdir(directory);
    const manuals = [];

    for (let i = 0; i < files.length; i++) {
        const filename = path.join(directory,files[i]);
        const stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            manuals.push(await getPages(filename,extension));
        } else if (filename.endsWith(extension)) {
            manuals.push(await parseManual(filename));
        };
    };

    return manuals;
}

/**
 * @param {string} directory
*/
const generatePages = async (directory) => {
    const manuals = await getPages(directory);
    console.log('number of manuals',manuals.length);

    /**
     * @type {Object.<string, Manual[]>}
    */
    const categories = {};

    for (let i = 0; i < manuals.length; i++) {
        const manual = manuals[i];
        if (!categories[manual.category]) {
            categories[manual.category] = [];
        }

        categories[manual.category].push(manual);
    };

    const sortedCategories = Object.keys(categories)
        .sort(((a,b) => a.localeCompare(b)))
        .map((key) => categories[key].sort((a,b) => a.name.localeCompare(b.name)));

    generatePage('name',sortedCategories);
};

/**
 * @param {Manual} manual
 * @param {Manual[][]} categories
*/
const generatePage = (name,categories) => {
    const page = nunjucks.render('./templates/base-template.njk',{
        categories: categories,
        title: 'Test',
        siteName: 'Site',
        content: 'Lorem Ipsum'
    });

    const generatedHtmlFolder = 'generated-html';
    if (!fs.existsSync(generatedHtmlFolder)) {
        fs.mkdir(generatedHtmlFolder);
    }

    fs.writeFile(path.join(generatedHtmlFolder,`${name}.html`),page,(err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("File created: ",name);
        }
    });
};

void generatePages('./content','.em.md');