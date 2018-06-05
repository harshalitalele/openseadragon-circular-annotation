var osd = OpenSeadragon({
    id:            "contentDiv",
    tileSources:   [
        "https://openseadragon.github.io/example-images/highsmith/highsmith.dzi"
    ],
    showNavigator: true,
    navigatorAutoFade: false,
    showNavigationControl: false
});

anno.makeAnnotatable(osd);

function activateCircularAnnotation() {
    anno.selectTypeAndActivateSelector('circle');
}
