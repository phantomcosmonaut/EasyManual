# What is Easy Manual?

An easy way to generate documentation for a project. It parses the contents of the specified input folder, looks for files ending in '.em.md' and converts
the markdown to templated html.
Markdown is a very common, very simple markup language [Markup Documentation](https://www.markdownguide.org/)

## How it works:

Styling and formatting is limited to the [Nunjucks](https://mozilla.github.io/nunjucks/) template being used.
Menu nav items are created by taking the filename of the .em.md file.
Nested nav items are created by taking the sub folder the file is in.

Easy manual expands on markdown slightly by adding **Tags**.  
Supported **Tags** include:

- Link
- Image

### Link Tag

Allows you to easily reference another page from with the markdown by writing @ + Link[MyPage].

### Image Tag

Same as Link but for images. Full filename must be specified for image e.g. @ + Image[MyImage.jpg].

@Image[../images/GTO.png]

For configuration: See @Link[Configuration]
