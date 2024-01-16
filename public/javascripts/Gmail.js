

document.querySelector("#createbtn")
     .addEventListener("click",function(){
     document.querySelector("#sender").style.display = "flex"
     // document.querySelector("#sender").style.transform= `translateY(-110%)`
})

document.querySelector("#close")
     .addEventListener("click",function(){
     document.querySelector("#sender").style.display = "none"
     // document.querySelector("#sender").style.transform= `translateY(0%)`
})

document.querySelector("#photo")
.addEventListener("click",function(){
     document.querySelector("#fileinp").click();
})
document.querySelector("#fileinp")
.addEventListener("change",function(){
     document.querySelector("#photoform").submit();
})
let arr = [];
arr.forEach(function(elem){
     
})

