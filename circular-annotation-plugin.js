//To Do:
//1. After drawing done of Circular annotation, set _currentSelector of annotator to default rectangular selector
//2. Unit testing
//3. Remove repetitive code

/**
 * The default selector: a simple click-and-drag rectangle selection tool.
 * @constructor
 */
annotorious.plugin.CircDragSelector = function() { }

/**
 * Initializes the selector.
 * @param {Element} canvas the canvas to draw on
 * @param {Object} annotator reference to the annotator
 */
annotorious.plugin.CircDragSelector.prototype.init = function(annotator, canvas) {
  /** @private **/
  this._OUTLINE = '#000000';

  /** @private **/
  this._STROKE = '#ffffff';
  
  /** @private **/
  this._FILL = false;
  
  /** @private **/
  this._HI_OUTLINE = '#000000';

  /** @private **/
  this._HI_STROKE = '#fff000';
  
  /** @private **/
  this._HI_FILL = false;

  /** @private **/
  this._OUTLINE_WIDTH = 1;

  /** @private **/
  this._STROKE_WIDTH = 1;

  /** @private **/
  this._HI_OUTLINE_WIDTH = 1;

  /** @private **/
  this._HI_STROKE_WIDTH = 1.2;
	
  /** @private **/
  this._canvas = canvas;
  
  /** @private **/
  this._annotator = annotator;

  /** @private **/
  this._g2d = canvas.getContext('2d');
  this._g2d.lineWidth = 1;
 
  /** @private **/
  this._anchor;
  
  /** @private **/
  this._opposite;

  /** @private **/
  this._enabled = false;

  /** @private **/
  this._mouseMoveListener;

  /** @private **/
  this._mouseUpListener;
}

/**
 * Attaches MOUSEUP and MOUSEMOVE listeners to the editing canvas.
 * @private
 */
annotorious.plugin.CircDragSelector.prototype._attachListeners = function(startPoint) {
  var self = this;  
  var canvas = this._canvas;
  
  this.circMouseMove = function(event) {
      var points = annotorious.events.ui.sanitizeCoordinates(event, canvas);
      if (self._enabled) {
          self._opposite = { x: points.x, y: points.y };

          self._g2d.clearRect(0, 0, canvas.width, canvas.height);

          var xdiff = self._opposite.x - self._anchor.x;
          var ydiff = self._opposite.y - self._anchor.y;

          var radius = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
          self.drawShape(self._g2d, {
              type: annotorious.shape.ShapeType.CIRCLE,
              geometry: {
                  x: self._anchor.x,
                  y: self._anchor.y,
                  radius: radius
              },
              style: {}
          });
      }
  };
  this._mouseMoveListener = this._canvas.addEventListener('mousemove', this.circMouseMove );

  this.circMouseUp = function(event) {
      console.log("mouse up called Harshali");
      var points = annotorious.events.ui.sanitizeCoordinates(event, canvas);
      var shape = self.getShape();

      event = (event.event_) ? event.event_ : event;

      self._enabled = false;
      if (shape) {
        var xdiff = self._opposite.x - self._anchor.x;
        var ydiff = self._opposite.y - self._anchor.y;
        var radius = Math.sqrt(xdiff*xdiff + ydiff*ydiff);

        shape.geometry.x = self._anchor.x;
        shape.geometry.y = self._anchor.y;
        shape.geometry.radius = radius;
        delete shape.geometry.height;
        delete shape.geometry.width;
        self._detachListeners();
        self._annotator.fireEvent(annotorious.events.EventType.SELECTION_COMPLETED,
            { mouseEvent: event, shape: shape, viewportBounds: self.getViewportBounds() });
      } else {
        self._annotator.fireEvent(annotorious.events.EventType.SELECTION_CANCELED);
        // On cancel, we "relay" the selection event to the annotator
        var annotations = self._annotator.getAnnotationsAt(points.x, points.y);
        if (annotations.length > 0)
            self._annotator.highlightAnnotation(annotations[0]);
        }
    };
    this._mouseUpListener = this._canvas.addEventListener('mouseup', this.circMouseUp);
};

/**
 * Detaches MOUSEUP and MOUSEMOVE listeners from the editing canvas.
 * @private
 */
annotorious.plugin.CircDragSelector.prototype._detachListeners = function() {
    if (this.circMouseMove) {
        this._canvas.removeEventListener('mousemove', this.circMouseMove);
        delete this._mouseMoveListener;
    }

    if (this.circMouseUp) {
        this._canvas.removeEventListener('mouseup', this.circMouseUp);
        delete this._mouseUpListener;
    }
}

/**
 * Selector API method: returns the selector name.
 * @returns the selector name
 */
annotorious.plugin.CircDragSelector.prototype.getName = function() {
  return 'circ_drag';
}

/**
 * Selector API method: returns the supported shape type.
 *
 * TODO support for multiple shape types?
 *
 * @return the supported shape type
 */
annotorious.plugin.CircDragSelector.prototype.getSupportedShapeType = function() {
    return "circle";
}

/**
 * Sets the properties on this selector.
 */
annotorious.plugin.CircDragSelector.prototype.setProperties = function(props) {  
  if (props.hasOwnProperty('outline'))
    this._OUTLINE = props['outline'];

  if (props.hasOwnProperty('stroke'))
    this._STROKE = props['stroke'];
 
  if (props.hasOwnProperty('fill'))
    this._FILL = props['fill'];

  if (props.hasOwnProperty('hi_outline'))
    this._HI_OUTLINE = props['hi_outline'];

  if (props.hasOwnProperty('hi_stroke'))
    this._HI_STROKE = props['hi_stroke'];

  if (props.hasOwnProperty('hi_fill'))
    this._HI_FILL = props['hi_fill'];

  if (props.hasOwnProperty('outline_width'))
    this._OUTLINE_WIDTH = props['outline_width'];

  if (props.hasOwnProperty('stroke_width'))
    this._STROKE_WIDTH = props['stroke_width'];

  if (props.hasOwnProperty('hi_outline_width'))
    this._HI_OUTLINE_WIDTH = props['hi_outline_width'];

  if (props.hasOwnProperty('hi_stroke_width'))
    this._HI_STROKE_WIDTH = props['hi_stroke_width'];
}

/**
 * Selector API method: starts the selection at the specified coordinates.
 * @param {number} x the X coordinate
 * @param {number} y the Y coordinate
 */
annotorious.plugin.CircDragSelector.prototype.startSelection = function(x, y) {
  var startPoint = {
    x: x,
    y: y
  };
  this._enabled = true;
  this._attachListeners(startPoint);
  this._anchor = new annotorious.shape.geom.Point(x, y);
  this._annotator.fireEvent(annotorious.events.EventType.SELECTION_STARTED, {
    offsetX: x, offsetY: y});
    
  document.body.style.webkitUserSelect = 'none';
}

/**
 * Selector API method: stops the selection.
 */
annotorious.plugin.CircDragSelector.prototype.stopSelection = function() {
  this._detachListeners();
  this._g2d.clearRect(0, 0, this._canvas.width, this._canvas.height);
  document.body.style.webkitUserSelect = 'auto';
  delete this._opposite;
}

/**
 * Selector API method: returns the currently edited shape.
 * @return {annotorious.shape.Shape | undefined} the shape
 */
annotorious.plugin.CircDragSelector.prototype.getShape = function() {
  if (this._opposite && 
     (Math.abs(this._opposite.x - this._anchor.x) > 3) && 
     (Math.abs(this._opposite.y - this._anchor.y) > 3)) {
       
    var viewportBounds = this.getViewportBounds();
    // var item_anchor = this._annotator.toItemCoordinates({x: viewportBounds.left, y: viewportBounds.top});
    // var item_opposite = this._annotator.toItemCoordinates({x: viewportBounds.right, y: viewportBounds.bottom});
 
    /*
    var rect = new annotorious.shape.geom.Rectangle(
      item_anchor.x,
      item_anchor.y,
      item_opposite.x - item_anchor.x,
      item_opposite.y - item_anchor.y
    );*/
      
    var point1 = this._annotator.toCircItemCoordinates({
      x: viewportBounds.left,
      y: viewportBounds.top
    });
      var point2 = this._annotator.toCircItemCoordinates({
      x: viewportBounds.right,
      y: viewportBounds.bottom
    });
      var xdiff = point1.x - point2.x;
      var ydiff = point1.y - point2.y;
        
      var radius = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
      
      var circProp = {
          borderRadius: "50%"
      };

      var shape = new annotorious.shape.Shape('circle', {
        x: point1.x,
        y: point1.y,
        radius: radius
    });
      shape.properties = {
          'border-radius': '50%'
      };
    return shape;
  } else {
    return undefined;
  }
}

/**
 * Selector API method: returns the bounds of the selected shape, in viewport (= pixel) coordinates.
 * @returns {Object} the shape viewport bounds
 */
annotorious.plugin.CircDragSelector.prototype.getViewportBounds = function() {
  var right, left;
  if (this._opposite.x > this._anchor.x) {
    right = this._opposite.x;
    left = this._anchor.x;
  } else {
    right = this._anchor.x;
    left = this._opposite.x;    
  }
  
  var top, bottom;
  if (this._opposite.y > this._anchor.y) {
    top = this._anchor.y;
    bottom = this._opposite.y;
  } else {
    top = this._opposite.y;
    bottom = this._anchor.y;    
  }
  
  return {top: top, right: right, bottom: bottom, left: left};
}

/**
 * TODO not sure if this is really the best way/architecture to handle viewer shape drawing
 * @param {Object} g2d graphics context
 * @param {annotorious.shape.Shape} shape the shape to draw
 * @param {boolean=} highlight if true, shape will be drawn highlighted
 */
annotorious.plugin.CircDragSelector.prototype.drawShape = function(g2d, shape, highlight) {
  var geom, stroke, fill, outline, outline_width, stroke_width;

  if (!shape.style) shape.style = {};
  
  if (highlight) {
      fill = shape.style.hi_fill || this._HI_FILL;
      stroke = shape.style.hi_stroke || this._HI_STROKE;
      outline = shape.style.hi_outline || this._HI_OUTLINE;
      outline_width = shape.style.hi_outline_width || this._HI_OUTLINE_WIDTH;
      stroke_width = shape.style.hi_stroke_width || this._HI_STROKE_WIDTH;
    } else {
      fill = shape.style.fill || this._FILL;
      stroke = shape.style.stroke || this._STROKE;
      outline = shape.style.outline || this._OUTLINE;
      outline_width = shape.style.outline_width || this._OUTLINE_WIDTH;
      stroke_width = shape.style.stroke_width || this._STROKE_WIDTH;
    }
      
      geom = shape.geometry;
      
      // Outline
    if (outline) {
        g2d.lineJoin = "round";
        g2d.lineWidth = outline_width;
        g2d.strokeStyle = outline;
        g2d.beginPath();
        g2d.arc(geom.x, geom.y, geom.radius + outline_width, 0, Math.PI * 2, true);
        g2d.stroke();
    }

    // Stroke
    if (stroke) {
      g2d.lineJoin = "miter";
      g2d.lineWidth = outline_width;
      g2d.strokeStyle = outline;
      g2d.beginPath();
      g2d.arc(geom.x, geom.y, geom.radius, 0, Math.PI * 2, true);
      g2d.stroke();
    }

    // Fill   
    if (fill) {
      g2d.lineJoin = "miter";
      g2d.lineWidth = outline_width;
      g2d.strokeStyle = outline;
      g2d.beginPath();
      g2d.arc(geom.x, geom.y, geom.radius, 0, Math.PI * 2, true);
      g2d.stroke();
    }
}

/**
 * Select specific shape/type for annotation and then activate selector only in case of OpenSeadragon
 */
annotorious.Annotorious.prototype.selectTypeAndActivateSelector = function(annotationType, opt_item_url_or_callback, opt_callback) {
    if(goog.isString(annotationType)) {
        goog.array.forEach(this._modules, function(module) {
            // To Do: Make it work for all the media types
            if(module instanceof annotorious.mediatypes.openseadragon.OpenSeadragonModule) {
                module.setAnnotationType(annotationType);
            }
        });

        this.activateSelector(opt_item_url_or_callback, opt_callback);
    } else {
        this.activateSelector(opt_item_url_or_callback, opt_callback);
    }
};

annotorious.mediatypes.openseadragon.OpenSeadragonModule.prototype.setAnnotationType = function(annotationType) {
    goog.array.forEach(this._annotators.getValues(), function(annotator) {
        annotator.setAnnotationSelector(annotationType);
    });
};

annotorious.mediatypes.openseadragon.OpenSeadragonAnnotator.prototype.setAnnotationSelector = function(annotationSelector) {
    //To Do: Remove hardcoded string "circle"
    if(annotationSelector == "circle") {
        var circSelector = new annotorious.plugin.CircDragSelector();
        circSelector.init(this, this._editCanvas);
        this._selectors.push(circSelector);
        this._currentSelector = circSelector;
    } else {
        var rectSelector = new annotorious.plugins.selection.RectDragSelector();
        rectSelector.init(this, this._editCanvas); 
        this._selectors.push(rectSelector);
        this._currentSelector = rectSelector;
    }
};

annotorious.mediatypes.openseadragon.OpenSeadragonAnnotator.prototype.toCircItemCoordinates = function(xy) {
    var offset = annotorious.dom.getOffset(this.element);

    var viewportPoint = new OpenSeadragon.Point(xy.x + offset.left, xy.y + offset.top);
    var viewElementPoint = this._osdViewer.viewport.windowToViewportCoordinates(viewportPoint);

    return viewElementPoint;
};

(function() {
    var oldAddAnnotation = annotorious.mediatypes.openseadragon.Viewer.prototype.addAnnotation;

    function toCamelCase(str) {
        return String(str).replace(/\-([a-z])/g, function(all, match) {
            return match.toUpperCase();
        });
    };

    function addCircularAnnotation(annotation, opt_replace) {
        var geometry = annotation.shapes[0].geometry;
        var outer = goog.dom.createDom('div', 'annotorious-ol-boxmarker-outer');
        var inner = goog.dom.createDom('div', 'annotorious-ol-boxmarker-inner');
        goog.style.setSize(inner, '100%', '100%');

        inner.style.borderRadius = "50%";
        outer.style.borderRadius = "50%";
        
        goog.dom.appendChild(outer, inner);
        var rect = new OpenSeadragon.Rect(geometry.x-geometry.radius, geometry.y-geometry.radius, 2*geometry.radius, 2*geometry.radius);

        var overlay = {annotation: annotation, outer: outer, inner: inner};

        var self = this;
        goog.events.listen(inner, goog.events.EventType.MOUSEOVER, function(event) {
            if (!self._currentlyHighlightedOverlay)
                self._updateHighlight(overlay);

            self._lastHoveredOverlay = overlay;
        });

        goog.events.listen(inner, goog.events.EventType.MOUSEOUT, function(event) {
            delete self._lastHoveredOverlay;
            self._popup.startHideTimer();
        });

        this._overlays.push(overlay);

        goog.array.sort(this._overlays, function(a, b) {
            var shapeA = a.annotation.shapes[0];
            var shapeB = b.annotation.shapes[0];
            return annotorious.shape.getSize(shapeB) - annotorious.shape.getSize(shapeA);
        });

        var zIndex = 1;
        goog.array.forEach(this._overlays, function(overlay) {
            goog.style.setStyle(overlay.outer, 'z-index', zIndex);
            zIndex++;
        });

        this._osdViewer.addOverlay(outer, rect);
    }


    annotorious.mediatypes.openseadragon.Viewer.prototype.addAnnotation = function(annotation, opt_replace) {
        if(annotation.shapes[0].geometry.radius) {
            addCircularAnnotation.apply(this, [annotation, opt_replace]);
        } else {
            oldAddAnnotation.apply(this, [annotation, opt_replace]);
        }
    }
})();
