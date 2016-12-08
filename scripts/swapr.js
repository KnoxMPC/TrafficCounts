// JavaScript Document
function prepareImageSwap(elem,mouseOver,mouseOutRestore,mouseDown,mouseUpRestore,mouseOut,mouseUp) { 
	//Do not delete these comments. 
	//Non-Obtrusive Image Swap Script V1.1 by Hesido.com 
	//Attribution required on all accounts 
    if (typeof(elem) == 'string') elem = document.getElementById(elem); 
    if (elem == null) return; 
    var regg = /(.*)(_up\.)([^\.]{3,4})$/ 
    var prel = new Array(), img, imgList, imgsrc, mtchd; 
    imgList = elem.getElementsByTagName('img');
    for (var i=0; img = imgList[i]; i++) { 
        if (!img.rolloverSet && img.src.match(regg)) { 
            mtchd = img.src.match(regg); 
            img.hoverSRC = mtchd[1]+'_over.'+ mtchd[3]; 
            img.outSRC = img.src; 
            if (typeof(mouseOver) != 'undefined') { 
                img.hoverSRC = (mouseOver) ? mtchd[1]+'_over.'+ mtchd[3] : false; 
                img.outSRC = (mouseOut) ? mtchd[1]+'_ou.'+ mtchd[3] : (mouseOver && mouseOutRestore) ? img.src : false; 
                img.mdownSRC = (mouseDown) ? mtchd[1]+'_md.' + mtchd[3] : false; 
                img.mupSRC = (mouseUp) ? mtchd[1]+'_mu.' + mtchd[3] : (mouseOver && mouseDown && mouseUpRestore) ? img.hoverSRC : (mouseDown && mouseUpRestore) ? img.src : false; 
                } 
            if (img.hoverSRC) {preLoadImg(img.hoverSRC); img.onmouseover = imgHoverSwap;} 
            if (img.outSRC) {preLoadImg(img.outSRC); img.onmouseout = imgOutSwap;} 
            if (img.mdownSRC) {preLoadImg(img.mdownSRC); img.onmousedown = imgMouseDownSwap;} 
            if (img.mupSRC) {preLoadImg(img.mupSRC); img.onmouseup = imgMouseUpSwap;} 
            img.rolloverSet = true; 
		}
	}	
    function preLoadImg(imgSrc) { 
        prel[prel.length] = new Image(); prel[prel.length-1].src = imgSrc;
	}
	
	//JK//ADDITION TO IMAGE TAGS WITH _UP IN SRC, THIS LOOKS FOR INPUT TAGS WITH _UP IN SRC
	inputList = elem.getElementsByTagName('input');	
	for (var i=0; input = inputList[i]; i++) { 
        if (!input.rolloverSet && input.src.match(regg)) { 
            mtchd = input.src.match(regg); 
            input.hoverSRC = mtchd[1]+'_over.'+ mtchd[3]; 
            input.outSRC = input.src; 
            if (typeof(mouseOver) != 'undefined') { 
                input.hoverSRC = (mouseOver) ? mtchd[1]+'_over.'+ mtchd[3] : false; 
                input.outSRC = (mouseOut) ? mtchd[1]+'_ou.'+ mtchd[3] : (mouseOver && mouseOutRestore) ? input.src : false; 
                input.mdownSRC = (mouseDown) ? mtchd[1]+'_md.' + mtchd[3] : false; 
                input.mupSRC = (mouseUp) ? mtchd[1]+'_mu.' + mtchd[3] : (mouseOver && mouseDown && mouseUpRestore) ? input.hoverSRC : (mouseDown && mouseUpRestore) ? input.src : false; 
                } 
            if (input.hoverSRC) {preLoadInput(input.hoverSRC); input.onmouseover = imgHoverSwap;} 
            if (input.outSRC) {preLoadInput(input.outSRC); input.onmouseout = imgOutSwap;} 
            if (input.mdownSRC) {preLoadInput(input.mdownSRC); input.onmousedown = imgMouseDownSwap;} 
            if (input.mupSRC) {preLoadInput(input.mupSRC); input.onmouseup = imgMouseUpSwap;} 
            input.rolloverSet = true; 
        } 
    }
	
	function preLoadInput(inputSrc) { 
        prel[prel.length] = new Image(); prel[prel.length-1].src = inputSrc; 
    }
	
} 

function imgHoverSwap() {this.src = this.hoverSRC;} 
function imgOutSwap() {this.src = this.outSRC;} 
function imgMouseDownSwap() {this.src = this.mdownSRC;} 
function imgMouseUpSwap() {this.src = this.mupSRC;}
	
