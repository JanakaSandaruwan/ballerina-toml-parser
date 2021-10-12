var str = 'kkr-09-90@##%%^&&_-#'
str = str.replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
console.log(str);