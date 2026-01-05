# MatrixEffect

Matrix text rain effect for websites. It is written in JavaScript and can be embedded in any element.

[See this page for a demo](https://kitsune.cat/matrixjs/index.html)

- **Author**: [LluisE](https://github.com/lluises)
- **Source**: [https://github.com/lluises/matrixjs](https://github.com/lluises/l1g)
- **Licence**: [https://www.mozilla.org/en-US/MPL/2.0/](https://www.mozilla.org/en-US/MPL/2.0/)



# Usage

Import the `matrix.js` file in your page:

```html
<script type="text/javascript" src="https://kitsune.cat/matrixjs/matrix.js"></script>
```

Create an element where the matrix effect will be placed. Can be any element with any identifier, but you must be able to point to it in javascript:

```html
<div id="matrix"></div>
```

Initialize the MatrixEffect class with your element:

```javascript
let elem = document.getElementById("matrix");
let matrix = MatrixEffect(elem);
matrix.set_recolor(true);
matrix.set_stop_on_blur(true);
matrix.run();
```

And the effect will roll.



# Example

```html
<html>
<head>
  <meta charset="utf-8">
  <title>Matrix.js - Example</title>
  <style>
   body {
     background-color: #FFF;
     margin: 0px
   }

   .matrix-background {
     position: fixed;
     display: block;
     top: 0;
     left: 0;
     width: 100vw;
     height: 100vh;
     z-index: 0;
   }
  </style>
  <script type="text/javascript" src="https://kitsune.cat/matrixjs/matrix.js"></script>
  <script>
   function main() {
     var elem = document.getElementsByClassName('matrix-background')[0];
     window.matrix = MatrixEffect(elem);
     window.matrix.set_recolor(true);
     window.matrix.set_stop_on_blur(true);
     window.matrix.run();
   }

   window.onload = main;
  </script>
</head>
<body class="main-page">
  <div class="matrix-background"></div>
</body>
</html>
```


# LICENSE

This project is licenced under the Mozilla Public License version 2.0. You may obtain a copy of the licence at the [LICENCE file in this repository](./LICENSE), or online at [https://www.mozilla.org/en-US/MPL/2.0/](https://www.mozilla.org/en-US/MPL/2.0/).
