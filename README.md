## PageTable

A simple table plugin to create the paging table. 
I have found the Simple Paging Grid from James Randall "<https://github.com/JamesRandall/Simple-Paging-Grid/tree/development>" and really like the idea,
but I don't like some detail implementations. So I ended up to try my own implementation.

## Usage

First include jQuery theme.

```html
<link type="text/css" href="css/bootstrap.css" rel="stylesheet" />
<link type="text/css" href="css/PageTable.css" rel="stylesheet" />
```

Include jQuery script. I use the underscore for template.

```html
<script type="text/javascript" src="script/jquery-1.10.2.js"></script>
<script type="text/javascript" src="script/underscore.js"></script>
<script type="text/javascript" src="script/PageTable.js"></script>
```

Create a place holder tag in your HTML page

```html
    <div id="exampleGrid"/></div>
```

There are two ways to create the table. If you already have data, just pass the dataSource like following.

```javascript
$("#exampleGrid").PageTable({
    columnNames: ["Name", "Price", "Quantity"],
    columnSortables: ["Name", "Price", "Quantity"],
    dataSource: source
});
```

The data source should have fomat like following.

```javascript
var data = [
    { "id": 1, "Name": "Pineapple line 1", "Price": 1.50, "Quantity": 4 },
    { "id": 2, "Name": "Strawberry", "Price": 1.10, "Quantity": 40 },
    { "id": 3, "Name": "Oranges", "Price": 0.20, "Quantity": 8 },
    { "id": 4, "Name": "Apples", "Price": 1.50, "Quantity": 5 },
    { "id": 5, "Name": "Raspberries", "Price": 1.50, "Quantity": 20 }];
```

If you don't have data yet, just pass the null dataSource and use call back function to refresh the table when data is ready.

```javascript
function refreshcallback() {
    $("#exampleGrid").PageTable('refresh', {dataSource: data});
}; 
```

The linkURL option follows the convension as specified in my blog <a href="http://xiaalex.wordpress.com/2013/05/23/restful-api-design/">RESTful API design</a>.

That's it. Enjoy.

## Authors

[Alex Xia](https://github.com/xiaalex)

