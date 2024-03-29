function startup() {
  var el =document.body;
  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchleave", handleEnd, false);
  el.addEventListener("touchmove", handleMove, false);
  log("initialized.");
}
var ongoingTouches = new Array;
var spotNum = {'x': 40, 'y': 40};
function handleStart(evt) {
	//  log("touchstart.");
	var el = document.getElementsByTagName("canvas")[0];
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;
	var offset = findPos(el);  
    
	for (var i = 0; i < touches.length; i++) {
		if(touches[i].clientX-offset.x >0 && 
	       touches[i].clientX-offset.x < parseFloat(el.width) && 
	       touches[i].clientY-offset.y >0 && 
	       touches[i].clientY-offset.y < parseFloat(el.height)) {
	       		var slotX = spotNum.x / 2 * Math.floor((touches[i].clientX-offset.x)/spotNum.x);
	       		var slotY = spotNum.y / 2 * Math.floor((touches[i].clientY-offset.y)/spotNum.y);
	            evt.preventDefault();
			    log("touchstart:" + i + "...");
			    ongoingTouches.push(copyTouch(touches[i]));
			    var color = colorForTouch(touches[i]);
			    ctx.beginPath();
				ctx.arc(slotX, slotY, parseFloat(el.width / spotNum.x / 2), 0, 2 * Math.PI, false); // a circle at the start
			    ctx.fillStyle = color;
			    ctx.fill();
			    log("touchstart:" + i + ".");
	  	}
 	}
}
function handleMove(evt) {

	var el = document.getElementsByTagName("canvas")[0];
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;
	var offset = findPos(el);

	for (var i = 0; i < touches.length; i++) {
        if(touches[i].clientX-offset.x >0 && 
           touches[i].clientX-offset.x < parseFloat(el.width) && 
           touches[i].clientY-offset.y >0 && 
           touches[i].clientY-offset.y < parseFloat(el.height)) {
            evt.preventDefault();
    		var color = colorForTouch(touches[i]);
    		var idx = ongoingTouchIndexById(touches[i].identifier);
			var slotX = spotNum.x / 2 * Math.floor((touches[i].clientX-offset.x)/spotNum.x);
       		var slotY = spotNum.y / 2 * Math.floor((touches[i].clientY-offset.y)/spotNum.y);
       		
		    if (idx >= 0) {
				log("continuing touch " + idx);
				ctx.beginPath();
				log("ctx.moveTo(" + ongoingTouches[idx].clientX + ", " + ongoingTouches[idx].clientY + ");");
				// ctx.moveTo(ongoingTouches[idx].clientX-offset.x, ongoingTouches[idx].clientY-offset.y);
				ctx.arc(slotX, slotY, parseFloat(el.width / spotNum.x / 2), 0, 2 * Math.PI, false); // a circle at the start
			    ctx.fillStyle = color;
			    ctx.fill();
				// log("ctx.lineTo(" + touches[i].clientX + ", " + touches[i].clientY + ");");
				// ctx.lineTo(touches[i].clientX-offset.x, touches[i].clientY-offset.y);
				// ctx.lineWidth = 4;
				// ctx.strokeStyle = color;
				// ctx.stroke();

				ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
				log(".");
		    } 
		    else {
		    	log("can't figure out which touch to continue");
		    }
  		}
    }
}
function handleEnd(evt) {

//  log("touchend/touchleave.");
  var el = document.getElementsByTagName("canvas")[0];
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;
  var offset = findPos(el);
        
  for (var i = 0; i < touches.length; i++) {
              if(touches[i].clientX-offset.x >0 && touches[i].clientX-offset.x < parseFloat(el.width) && touches[i].clientY-offset.y >0 && touches[i].clientY-offset.y < parseFloat(el.height)){
                    evt.preventDefault();
    var color = colorForTouch(touches[i]);
    var idx = ongoingTouchIndexById(touches[i].identifier);
        
    if (idx >= 0) {
      ctx.lineWidth = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].clientX-offset.x, ongoingTouches[idx].clientY-offset.y);
      ctx.lineTo(touches[i].clientX-offset.x, touches[i].clientY-offset.y);
      ctx.fillRect(touches[i].clientX - 4-offset.x, touches[i].clientY - 4-offset.y, 8, 8); // and a square at the end
      ongoingTouches.splice(i, 1); // remove it; we're done
    } else {
      log("can't figure out which touch to end");
    }
  }
        }
}
function handleCancel(evt) {
  evt.preventDefault();
  log("touchcancel.");
  var touches = evt.changedTouches;
  
  for (var i = 0; i < touches.length; i++) {
    ongoingTouches.splice(i, 1); // remove it; we're done
  }
}
function colorForTouch(touch) {
  var r = touch.identifier % 16;
  var g = Math.floor(touch.identifier / 3) % 16;
  var b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  var color = "#" + r + g + b;
  log("color for touch with identifier " + touch.identifier + " = " + color);
  return color;
}
function copyTouch(touch) {
  return {identifier: touch.identifier,clientX: touch.clientX,clientY: touch.clientY};
}
function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;
    
    if (id == idToFind) {
      return i;
    }
  }
  return -1; // not found
}
function log(msg) {
  var p = document.getElementById('log');
  p.innerHTML = msg + "\n" + p.innerHTML;
}
 
function findPos (obj) {
    var curleft = 0,
        curtop = 0;

    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);

        return { x: curleft-document.body.scrollLeft, y: curtop-document.body.scrollTop };
    }
}