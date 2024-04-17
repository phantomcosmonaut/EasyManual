# What is Easy Manual?

An easy way to generate documentation for a project. It parses the contents of the specified input folder, looks for files ending in '.em.md' and converts
the markdown to templated html.
Markdown is a very common, very simple markup language [Markup Documentation](https://www.markdownguide.org/)

## How it works:

Styling and formatting is limited to the [Nunjucks](https://mozilla.github.io/nunjucks/) template being used.
Menu nav items are created by taking the filename of the .em.md file.

Easy manual expands on markdown slightly by adding **Tags**.  
Supported **Tags** include:

- Page
- Image
- Group

### Page Tag

Allows you to easily reference another page from with the markdown by writing @Page[MyPage].

### Image Tag

Same as Page but for images and the file extension must be used: @Image[MyImage.jpg]. Only use the file name, do not reference the full path.

### Group Tag

Places nav links into an accordion style nav element by group