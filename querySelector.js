'use strict';
(function () {

  HTMLDocument.prototype.querySelectorAll = HTMLDocument.prototype.querySelector = undefined;
  HTMLElement.prototype.querySelectorAll = HTMLElement.prototype.querySelector = undefined;

  // Some utility methods.
  var trim = function trim (str) {
    if (typeof str === 'string') {
      return str.trim();
    }

    if (Object.prototype.toString.call(str) === '[object Array]') {
      for (var i = 0, l = str.length; i !== l; ++i) {
        str[i] = str[i].trim();
      }
    }
    return str;
  };

  var fetchSelector = function fetchSelector (str, regex) {
    if (typeof str !== 'string' ||
        Object.prototype.toString.call(regex) !== '[object RegExp]') {
      throw TypeError;
    }

    return {
      selectors: str.match(regex) || [],
      ruleStr: str.replace(regex, ' ')
    };
  };

  var getElementsBySelector = function getElementsBySelector (selector) {
    var context = this;
    var temp, tempElements, elements = [];

    // IDs. e.g. #mail-title
    temp = fetchSelector(selector, /#[\w-_]+/g);
    var id = temp.selectors ? temp.selectors[0] : null;
    selector = temp.ruleStr;

    // classes. e.g. .row
    temp = fetchSelector(selector, /\.[\w-_]+/g);
    var classes = temp.selectors;
    selector = temp.ruleStr;

    // TODO: Now only support "equal".
    // attributes. e.g. [rel=external]
    temp = fetchSelector(selector, /\[.+?\]/g);
    var attributes = temp.selectors;
    selector = temp.ruleStr;

    // elements. E.g. header, div
    temp = fetchSelector(selector, /\w+/g);
    var els = temp.selectors;
    selector = temp.ruleStr;

    tempElements = []; // Emptify tempElements.
    // Get By ID
    // ID is supposed to be unique.
    // More need to attach other selectors.
    if (id) {
      id = id.substring(1);
      return [document.getElementById(id) || null];
    }

    // Get By Elements
    if (els.length !== 0) {
      var temps = context.getElementsByTagName(els[0]);
      tempElements = tempElements.concat(Array.prototype.slice.call(temps));
    }

    // Get By Class
    for (var i = 0, l = classes.length; i !== l; ++i) {
      var className = classes[i].substring(1);
      var temps = context.getElementsByClassName(className);
      temps = Array.prototype.slice.call(temps);
      // If no temp elements yet, push into tempElements directly.
      if (tempElements.length === 0) {
        tempElements = tempElements.concat(temps);
      }
      // Otherwise, find intersection.
      else {
        var prevs = [];
        prevs = prevs.concat(tempElements);
        tempElements = [];

        for (var tempI = 0, tempL = temps.length; tempI !== tempL; ++tempI) {
          var t = temps[tempI];
          if (prevs.indexOf(t) !== -1) {
            tempElements = tempElements.concat([t]);
          }
        }
      }

    }

    // Get By Attributes
    if (attributes.length !== 0) {
      var attrs = {};
      for (var i = 0, l = attributes.length; i !== l; ++i) {
        var attribute = attributes[i];
        attribute = attribute.substring(1, attribute.length - 1);
        var parts = attribute.split('=');
        parts = trim(parts);
        attrs[parts[0]] = parts[1];
      }
      var prevs = [];
      prevs = prevs.concat(tempElements);
      tempElements = [];
      for (var i = 0, l = prevs.length; i !== l; ++i) {
        var t = prevs[i];
        var shouldAdd = true;
        for (var key in attrs) {
          if (t.getAttribute(key) !== attrs[key]) {
            shouldAdd = false;
            break;
          }
        }
        if (shouldAdd) {
          tempElements = tempElements.concat([t]);
        }
      }

    }





    elements = elements.concat(tempElements);
    return elements;
  };

  // querySelectorAll
  if (!document.querySelectorAll ||
      !HTMLElement.prototype.querySelectorAll ||
      !HTMLDocument.prototype.querySelectorAll) {
    document.querySelectorAll =
    HTMLDocument.prototype.querySelectorAll =
    HTMLElement.prototype.querySelectorAll = function querySelectorAll (selector) {
      if (typeof selector !== 'string') {
        throw new TypeError('document.querySelectorAll: Invalid selector type. ' +
                            'Expect: string. Found: ' + typeof selector + '.');
      }
      var elements = [];

      // Split `selector` into rules by `,`.
      var rules = selector.split(',');
      rules = trim(rules);

      // Iterate through each rule.
      // For the sake of performance, use for-loop here rather than forEach.
      for (var i = 0, l = rules.length; i !== l; ++i) {
        var rule = rules[i];

        // TODO: Support ' ' and '>'

        elements = elements.concat(getElementsBySelector.call(this, rule));
      }

      return elements;
    };
  }


  // querySelector
  if (!document.querySelector ||
      !HTMLElement.prototype.querySelector ||
      !HTMLDocument.prototype.querySelector) {
    document.querySelector =
    HTMLDocument.prototype.querySelector =
    HTMLElement.prototype.querySelector = function querySelector (selector) {
      var elements = this.querySelectorAll(selector);
      return elements.length > 0 ? elements[0] : null;
    };
  }

})();
