## openseadragon-circular-annotation (Under development)

An [Annotorious](https://annotorious.github.io/s) plugin that provides APIs to draw circular annotations on [OpenSeadragon](http://openseadragon.github.io/) viewer.

### How to Use:

Note: Presently this does not work with minified version of annotorious library.

To draw circular annotations on openseadragon viewer, include ```'/css/annotorious.css'``` and ```'/annotorious-dev.js'``` file as per the [example](https://github.com/harshalitalele/openseadragon-circular-annotation/tree/gh-pages) into the project after including OpenSeadragon library.

Then include ```'/circular-annotation-plugin.js'``` file.

```markdown

<link type="text/css" rel="stylesheet" href="css/annotorious.css" />
<script src="annotorious-dev.js"></script>
<script src="circular-annotation-plugin.js"></script>

```

Then it can be used like this:

```markdown

anno.makeAnnotatable(osd);

function activateCircularAnnotation() {
    anno.selectTypeAndActivateSelector('circle');
}

function activateRectAnnotation() {
    anno.selectTypeAndActivateSelector('rect');
}

```

### Demo:

[Demo](https://harshalitalele.github.io/openseadragon-circular-annotation/)
