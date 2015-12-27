### querySelector & querySelectorAll Polyfill

#### Example

~~~js
var nav = document.querySelector('nav');
var anchors = nav.querySelectorAll('a[rel*="external"]');
~~~

#### Limitations

+ Does not support pseudo selectors, such as ":before", ":after", ":hover".
+ Does not support the selection of child nodes. I.e. you can't do things like: `document.querySelector('nav #target');`. Instead, you have to do like `var nav = document.querySelector('nav'); var target = nav.querySelector('#target');`.

#### License

MIT