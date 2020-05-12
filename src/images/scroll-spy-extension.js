function CreateAnchorListHTML(query){
    var matches = document.querySelectorAll(query);
var resultHtml = document.createElement("ul");
resultHtml.classList.add("menu-list");
var queue = [];
var isH2 = false;
var ul;
for(var i=0;i<matches.length;i++){
	var hash = Math.floor(Math.random() * 1000);
	matches[i].id = matches[i].textContent + "(" + hash.toString() + ")";
	var li =  document.createElement("li");
   var a = document.createElement("a");
   a.href = "#"+matches[i].textContent + "(" + hash.toString() + ")";
   a.innerText = matches[i].textContent;
   li.appendChild(a);
	if(isH2 == false && matches[i].tagName == "H2"){
		ul = document.createElement("ul");
		ul.appendChild(li);
		isH2 = true;
	}
	else if(isH2 == true && matches[i].tagName != "H2"){
		isH2 = false;
		var tmp = queue.pop();
		tmp.appendChild(ul);
		queue.push(tmp);
		queue.push(li);
	}
	else if(isH2 == true){
		ul.appendChild(li);
	}
	else if(isH2 == false && matches[i].tagName == "H1"){
		queue.push(li);
	}
}
while(queue.length > 0){
	resultHtml.appendChild(queue.shift());
}
return resultHtml;
}