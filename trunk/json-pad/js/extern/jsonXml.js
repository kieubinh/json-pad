/*
	The below work is licensed under Creative Commons GNU LGPL License.

	Original work:

	License:     http://creativecommons.org/licenses/LGPL/2.1/
	Author:      Stefan Goessner/2006
	Web:         http://goessner.net/ 

	Modifications made:

	Version:     0.9-p5
	Description: Restructured code, JSLint validated (no strict whitespaces),
	             added handling of empty arrays, empty strings, and int/floats values.
	Author:      Michael Schøler/2008-01-29
	Web:         http://michael.hinnerup.net/blog/2008/01/26/converting-json-to-xml-and-xml-to-json/
*/
/*global alert */
var xmlJsonClass={
    xml2json:function(xml,tab, quotePropName){
	if(xml.nodeType===9){
	    xml=xml.documentElement;
	}
	var nws=this.removeWhite(xml);
	var obj=this.toObj(nws);
	var json=this.toJson(obj,xml.nodeName,"\t",quotePropName);
	return"{\n"+tab+(tab?json.replace(/\t/g,tab):json.replace(/\t|\n/g,""))+"\n}";
    },
    json2xml:function(o,tab){
	var toXml=function(v,name,ind){
	    var xml="";
	    var i,n;
	    if(v instanceof Array){
		if(v.length===0){
		    xml+=ind+"<"+name+">__EMPTY_ARRAY_</"+name+">\n";
		}
		else{
		    for(i=0,n=v.length;i<n;i+=1){
			var sXml=ind+toXml(v[i],name,ind+"\t")+"\n";
			xml+=sXml;
		    }
		    }
		}
    else if(typeof(v)==="object"){
	var hasChild=false;
	xml+=ind+"<"+name;
	var m;
	for(m in v)if(v.hasOwnProperty(m)){
	    if(m.charAt(0)==="@"){
		xml+=" "+m.substr(1)+"=\""+v[m].toString()+"\"";
	    }
	    else{
		hasChild=true;
	    }
	}
    xml+=hasChild?">":"/>";
    if(hasChild){
	for(m in v)if(v.hasOwnProperty(m)){
	    if(m==="#text"){
		xml+=v[m];
	    }
	    else if(m==="#cdata"){
		xml+="<![CDATA["+v[m]+"]]>";
	    }
	    else if(m.charAt(0)!=="@"){
		xml+=toXml(v[m],m,ind+"\t");
	    }
	}
    xml+=(xml.charAt(xml.length-1)==="\n"?ind:"")+"</"+name+">";
}
}
else{
    if(v.toString()==="\"\""||v.toString().length===0){
	xml+=ind+"<"+name+">__EMPTY_STRING_</"+name+">";
    }
    else{
	xml+=ind+"<"+name+">"+v.toString()+"</"+name+">";
    }
}
return xml;
};

var xml="";
var m;
for(m in o)if(o.hasOwnProperty(m)){
    xml+=toXml(o[m],m,"");
}
return tab?xml.replace(/\t/g,tab):xml.replace(/\t|\n/g,"");
},
toObj:function(xml){
    var o={};

    if(xml.nodeType===1){
	if(xml.attributes.length){
	    var i;
	    for(i=0;i<xml.attributes.length;i+=1){
		o["@"+xml.attributes[i].nodeName]=(xml.attributes[i].nodeValue||"").toString();
	    }
	    }
    if(xml.firstChild){
	var textChild=0,cdataChild=0,hasElementChild=false;
	var n;
	for(n=xml.firstChild;n;n=n.nextSibling){
	    if(n.nodeType===1){
		hasElementChild=true;
	    }
	    else if(n.nodeType===3&&n.nodeValue.match(/[^ \f\n\r\t\v]/)){
		textChild+=1;
	    }
	    else if(n.nodeType===4){
		cdataChild+=1;
	    }
	}
    if(hasElementChild){
	if(textChild<2&&cdataChild<2){
	    this.removeWhite(xml);
	    for(n=xml.firstChild;n;n=n.nextSibling){
		if(n.nodeType===3){
		    o["#text"]=this.escape(n.nodeValue);
		}
		else if(n.nodeType===4){
		    o["#cdata"]=this.escape(n.nodeValue);
		}
		else if(o[n.nodeName]){
		    if(o[n.nodeName]instanceof Array){
			o[n.nodeName][o[n.nodeName].length]=this.toObj(n);
		    }
		    else{
			o[n.nodeName]=[o[n.nodeName],this.toObj(n)];
		    }
		}
	    else{
		o[n.nodeName]=this.toObj(n);
	    }
	    }
	}
else{
    if(!xml.attributes.length){
	o=this.escape(this.innerXml(xml));
    }
    else{
	o["#text"]=this.escape(this.innerXml(xml));
    }
}
}
else if(textChild){
    if(!xml.attributes.length){
	o=this.escape(this.innerXml(xml));
	if(o==="__EMPTY_ARRAY_"){
	    o="[]";
	}else if(o==="__EMPTY_STRING_"){
	    o="";
	}
    }
else{
    o["#text"]=this.escape(this.innerXml(xml));
}
}
else if(cdataChild){
    if(cdataChild>1){
	o=this.escape(this.innerXml(xml));
    }
    else{
	for(n=xml.firstChild;n;n=n.nextSibling){
	    o["#cdata"]=this.escape(n.nodeValue);
	}
	}
    }
}
if(!xml.attributes.length&&!xml.firstChild){
    o=null;
}
}
else if(xml.nodeType===9){
    o=this.toObj(xml.documentElement);
}
else{
    alert("unhandled node type: "+xml.nodeType);
}
return o;
},
toJson:function(o,name,ind,quotePropName){
    var json=name?((quotePropName || name.search(/[\W]/) != -1 ? "\"" : "") +name+(quotePropName || name.search(/[\W]/) != -1 ? "\"" : "")):"";
    if(o==="[]"){
	json+=(name?":[]":"[]");
    }
    else if(o instanceof Array){
	var n,i;
	for(i=0,n=o.length;i<n;i+=1){
	    o[i]=this.toJson(o[i],"",ind+"\t",quotePropName);
	}
	json+=(name?":[":"[")+(o.length>1?("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind):o.join(""))+"]";
    }
    else if(o===null){
	json+=(name&&":")+"null";
    }
    else if(typeof(o)==="object"){
	var arr=[];
	var m;
	for(m in o)if(o.hasOwnProperty(m)){
	    arr[arr.length]=this.toJson(o[m],m,ind+"\t",quotePropName);
	}
	json+=(name?":{":"{")+(arr.length>1?("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind):arr.join(""))+"}";
    }
    else if(typeof(o)==="string"){
	o=o.toString();
	var objRegExp=/(^-?\d+\.?\d*$)/;
	if(objRegExp.test(o)){
	    json+=(name&&":")+o;
	}
	else{
	    json+=(name&&":")+"\""+o+"\"";
	}
    }
else{
    json+=(name&&":")+o.toString();
}
return json;
},
innerXml:function(node){
    var s="";
    if("innerHTML"in node){
	s=node.innerHTML;
    }
    else{
	var asXml=function(n){
	    var s="",i;
	    if(n.nodeType===1){
		s+="<"+n.nodeName;
		for(i=0;i<n.attributes.length;i+=1){
		    s+=" "+n.attributes[i].nodeName+"=\""+(n.attributes[i].nodeValue||"").toString()+"\"";
		}
		if(n.firstChild){
		    s+=">";
		    for(var c=n.firstChild;c;c=c.nextSibling){
			s+=asXml(c);
		    }
		    s+="</"+n.nodeName+">";
		}
		else{
		    s+="/>";
		}
	    }
	else if(n.nodeType===3){
	    s+=n.nodeValue;
	}
	else if(n.nodeType===4){
	    s+="<![CDATA["+n.nodeValue+"]]>";
	}
	return s;
    };

    for(var c=node.firstChild;c;c=c.nextSibling){
	s+=asXml(c);
    }
    }
return s;
},
escape:function(txt){
    return txt.replace(/[\\]/g,"\\\\").replace(/[\"]/g,'\\"').replace(/[\n]/g,'\\n').replace(/[\r]/g,'\\r');
},
removeWhite:function(e){
    e.normalize();
    var n;
    for(n=e.firstChild;n;){
	if(n.nodeType===3){
	    if(!n.nodeValue.match(/[^ \f\n\r\t\v]/)){
		var nxt=n.nextSibling;
		e.removeChild(n);
		n=nxt;
	    }
	    else{
		n=n.nextSibling;
	    }
	}
    else if(n.nodeType===1){
	this.removeWhite(n);
	n=n.nextSibling;
    }
    else{
	n=n.nextSibling;
    }
    }
return e;
}
};