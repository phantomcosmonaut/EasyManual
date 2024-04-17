import fsPromises from 'fs/promises';
import fs from 'fs';
import Tags from './RegexPatterns.js'; // TODO remove js extension
import { toTitleCase } from './helpers.js';
import showdown from 'showdown';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extension = '.em.md';
const configFileName = 'config.em.json';
const defaultConfig = {
    homePage: 'Home',
    templateFile: path.join(__dirname, '..', 'templates', 'base-template.njk')
};
const parseManual = async (filename) => {
    let text = await fsPromises.readFile(filename, { encoding: 'utf8' });
    const fileParts = filename.split(path.sep);
    const fileWithExtension = fileParts[fileParts.length - 1];
    const name = toTitleCase(fileWithExtension.slice(0, fileWithExtension.length - 6)); // removes '.em.md' file extension
    const groupMatch = Tags.group.exec(text);
    const group = groupMatch?.[1] ?? name;
    if (groupMatch != null) {
        text = text.replace(groupMatch[0], '');
    }
    const images = [];
    let match = null;
    while ((match = Tags.image.exec(text)) != null) {
        const image = match[1];
        const altName = image.split('.')[0];
        text = text.replace(match[0], `![${altName}](${image})`);
        images.push(image);
    }
    while ((match = Tags.page.exec(text)) != null) {
        const page = match[1];
        text = text.replace(match[0], `[${page}](${page}.html)`);
    }
    const converter = new showdown.Converter();
    const html = converter.makeHtml(text);
    return {
        group,
        name,
        html,
        images
    };
};
const getPages = async (directory, outputDirectory, otherFoundFiles) => {
    if (!fs.existsSync(directory)) {
        throw `Directory not found: ${directory}.`;
    }
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdir(outputDirectory, () => console.log("Create output directory.", outputDirectory));
    }
    const files = await fsPromises.readdir(directory);
    let manuals = [];
    for (let i = 0; i < files.length; i++) {
        const filename = path.join(directory, files[i]);
        const stats = fs.lstatSync(filename);
        if (stats.isDirectory()) {
            const recursiveResults = await getPages(filename, outputDirectory, otherFoundFiles);
            manuals = manuals.concat(recursiveResults);
        }
        else if (filename.endsWith(extension)) {
            manuals.push(await parseManual(filename));
        }
        else {
            otherFoundFiles.push(filename);
        }
    }
    ;
    return manuals;
};
const getConfig = async (directory) => {
    const text = await fsPromises.readFile(path.join(directory, configFileName), { encoding: 'utf8' });
    const config = JSON.parse(text);
    return {
        ...defaultConfig,
        ...config
    };
};
const generatePage = (manual, groups, config, outputDirectory, template) => {
    const page = nunjucks.renderString(template, {
        groups: groups.filter((group) => group[0].name !== config.homePage),
        content: manual.html,
        pageName: manual.name,
        groupName: manual.group,
        homePageName: config.homePage
    });
    fs.writeFile(path.join(outputDirectory, `${manual.name}.html`), page, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Page created:", manual.name);
        }
    });
};
export const generatePages = async (directory, outputDirectory) => {
    const config = await getConfig(directory);
    const otherFoundFiles = [];
    const [manuals, template] = await Promise.all([
        getPages(directory, outputDirectory, otherFoundFiles),
        fsPromises.readFile(config.templateFile, { encoding: 'utf8' })
    ]);
    console.log(`Found ${manuals.length} markdown files.`);
    const filesToCopy = manuals
        .flatMap((manual) => manual.images.map((image) => otherFoundFiles.find((file) => file.toLocaleLowerCase().endsWith(image.toLowerCase()))))
        .filter((file) => typeof file === 'string')
        .map((file) => {
        // flatten the file path for easy reference within the generated html
        const fileParts = file.split(path.sep);
        const fileWithExtension = fileParts[fileParts.length - 1];
        const outputFile = path.join(outputDirectory, fileWithExtension);
        console.log('Copying file to output:', fileWithExtension);
        return fsPromises.copyFile(file, outputFile);
    });
    await Promise.all(filesToCopy);
    const groups = {};
    for (let i = 0; i < manuals.length; i++) {
        const manual = manuals[i];
        if (!groups[manual.group]) {
            groups[manual.group] = [];
        }
        groups[manual.group].push(manual);
    }
    ;
    const sortedGroups = Object.keys(groups)
        .sort(((a, b) => a.localeCompare(b)))
        .map((key) => groups[key].sort((a, b) => a.name.localeCompare(b.name)));
    sortedGroups
        .flatMap((group) => group)
        .forEach((manual) => generatePage(manual, sortedGroups, config, outputDirectory, template));
};
