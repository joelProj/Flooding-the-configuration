var size = 100;
var a = new Array(size);
for(let i = 0; i < size; ++i){
    a[i] = new Array(size);
    a[i].fill(1);
}
var str = JSON.stringify(a);
str = str.replace(/],/g, '],\n');
console.log(str);