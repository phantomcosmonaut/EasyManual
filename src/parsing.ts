import fsPromises from 'fs/promises';
import fs from 'fs';
import Tags from './RegexPatterns.js'; // TODO remove js extension
import { toTitleCase } from './helpers.js';
import showdown from 'showdown';
import nunjucks from 'nunjucks';
import path from 'path';

const extension = '.em.md';
const configFileName = 'config.em.json';

interface IConfig {
    homePage: string;
    templateFile: string;
}

const defaultConfig: IConfig = {
    homePage: 'Home',
    templateFile: './templates/base-template.njk'
};

interface IManual {
    name: string;
    group: string;
    html: string;
}

const parseManual = async (inputDirectory: string, outputDirectory: string, filename: string): Promise<IManual> => {
    let text = await fsPromises.readFile(filename, { encoding: 'utf8' });
    const fileParts = filename.split(path.sep);
    const fileWithExtension = fileParts[fileParts.length - 1];
    const name = toTitleCase(fileWithExtension.slice(0, fileWithExtension.length - 6)); // removes '.em.md' file extension
    const groupMatch = Tags.group.exec(text);
    const group = groupMatch?.[1] ?? name;
    if (groupMatch != null) {
        text = text.replace(groupMatch[0], '');
    }

    let match: RegExpExecArray | null = null;
    while ((match = Tags.image.exec(text)) != null) {
        const image = match[1];
        const altName = image.split('.')[0];
        text = text.replace(match[0], `![${altName}](${image})`);
        await fsPromises.copyFile(path.join(inputDirectory, image), path.join(outputDirectory, image));
        console.log(`Copied image to output folder: ${image}`);
    }

    while ((match = Tags.link.exec(text)) != null) {
        const page = match[1];
        text = text.replace(match[0], `[${page}](${page}.html)`);
    }

    const converter = new showdown.Converter();
    const html = converter.makeHtml(text);

    return {
        group,
        name,
        html
    }
};

const getPages = async (directory: string, outputDirectory: string): Promise<IManual[]> => {
    if (!fs.existsSync(directory)) {
        throw `Directory not found: ${directory}.`;
    }

    const files = await fsPromises.readdir(directory);
    let manuals: IManual[] = [];

    for (let i = 0; i < files.length; i++) {
        const filename = path.join(directory, files[i]);
        const stats = fs.lstatSync(filename);
        if (stats.isDirectory()) {
            const recursiveResults = await getPages(filename, outputDirectory);
            manuals = manuals.concat(recursiveResults);
        } else if (filename.endsWith(extension)) {
            manuals.push(await parseManual(directory, outputDirectory, filename));
        }
    };

    return manuals
}

const getConfig = async (directory: string): Promise<IConfig> => {
    const text = await fsPromises.readFile(path.join(directory, configFileName), { encoding: 'utf8' });
    const config = JSON.parse(text) as IConfig;

    return {
        ...defaultConfig,
        ...config
    };
}

const generatePage = (manual: IManual, groups: IManual[][], config: IConfig, outputDirectory: string) => {
    if (!config.templateFile) {
        throw 'Missing template file name.';
    }

    const page = nunjucks.render(config.templateFile, {
        groups: groups.filter((group) => group[0].name !== config.homePage),
        content: manual.html,
        pageName: manual.name,
        groupName: manual.group,
        homePageName: config.homePage
    });

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdir(outputDirectory, () => null);
    }

    fs.writeFile(path.join(outputDirectory, `${manual.name}.html`), page, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Page created: ", manual.name);
        }
    });
};

export const generatePages = async (directory: string, outputDirectory: string) => {
    const config = await getConfig(directory);
    const manuals = await getPages(directory, outputDirectory);
    console.log(`Found ${manuals.length} markdown files.`);

    const groups: Record<string, IManual[]> = {};

    for (let i = 0; i < manuals.length; i++) {
        const manual = manuals[i];
        if (!groups[manual.group]) {
            groups[manual.group] = [];
        }

        groups[manual.group].push(manual);
    };

    const sortedGroups = Object.keys(groups)
        .sort(((a, b) => a.localeCompare(b)))
        .map((key) => groups[key].sort((a, b) => a.name.localeCompare(b.name)));

    sortedGroups
        .flatMap((group) => group)
        .forEach((manual) => generatePage(manual, sortedGroups, config, outputDirectory));
};
