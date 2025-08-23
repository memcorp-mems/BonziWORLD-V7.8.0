var $ = (a) => {return document.getElementById(a)}
var clickSound = new Audio('https://ia600601.us.archive.org/11/items/windowsxpstartup_201910/Windows%20XP%20Start.mp3');
let idcounter = 0;
let moving = false;
let target;
let announcements = [];
let poll;
document.addEventListener('mousedown', playClickSound);
document.addEventListener('touchstart', playClickSound);
function movestart(mouse, self){
    if(moving) return;
    if(mouse.touches != undefined) mouse = mouse.touches[0];
    target = self;
    //Find offset of mouse to target
    target.offsetx = mouse.clientX - target.x;
    target.offsety = mouse.clientY - target.y;
    target.lx = target.x;
    target.ly = target.y;
    //Enable moving
    moving = window.cont == undefined;
}
function playClickSound() {
    clickSound.play();
}
class msWindow{
    constructor(title, html, x, y, width, height, buttons){
        this.x = x;
        this.y = y;
        this.toppad = 0;
        this.w = !width ? "auto" : width;
        this.h = !height ? "auto": height;
        this.lx = x;
        this.ly = y;
        this.id = idcounter+"w";
        let btncounter = 0;
        idcounter++;
        if(buttons == undefined) buttons = [{name: "CLOSE"}]
        html+="<center class='buttonbar'>";
        buttons.forEach((button)=>{
            html+="<button class='msBtn' id='"+this.id+"b"+btncounter+"'>"+button.name+"</button> &nbsp; ";
            button.id = btncounter;
            btncounter++;
        })
        html+="</center>";
        document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", `
            <div id='`+this.id+`p' style='top:`+y+`;left:`+x+`;height: `+height+`px;width: `+width+`px;max-width: 80%;' class='msWindow_cont'>
            <p id="`+this.id+`t" class='msWindow_title'>`+title+` &nbsp; <button class="log_close" id='`+this.id+`close'></button></p>
            <div class='msWindow_body'>`+html+`</div>
            </div>
            `);
        //Button function handler
        buttons.forEach((button)=>{
            $(this.id+"b"+button.id).onclick = ()=>{
                if(button.callback != undefined) button.callback();
                this.kill();
            };
        })
        $(this.id+"close").onclick = ()=>{this.kill()};
        //Move starter
        $(this.id+"t").addEventListener("mousedown", mouse=>{movestart(mouse, this)});
        $(this.id+"t").addEventListener("touchstart", mouse=>{movestart(mouse.touches[0], this)});
        this.w = $(this.id+"p").clientWidth+10;
        this.h = $(this.id+"p").clientHeight;
        this.check();

        //If x y undefined, center
        if(x == undefined && y == undefined){
          this.y = innerHeight/2 - $(this.id+"p").clientHeight/2;
          this.x = innerWidth/2 - $(this.id+"p").clientWidth/2;
          $(this.id+"p").style.top = this.y;
          $(this.id+"p").style.left = this.x;
        }

        //Force constant width
        $(this.id+"p").style.width = this.w;
    }
    update(){
        $(this.id+"p").style.left = this.x;
        $(this.id+"p").style.top = this.y;
    }
    kill(){
        $(this.id+"p").remove();
        if(announcements.includes(this)) announcements.splice(announcements.indexOf(this), 1);
        else if(poll == this) poll = undefined;
        delete this;
    }
    check(){
        if(this.x < 0) this.x = 0;
        else if(this.x > innerWidth - this.w-25) this.x = innerWidth - this.w-25;
        if(this.y < 0) this.y = 0;
        else if(this.y > innerHeight - this.h-50) this.y = innerHeight - this.h-50;
        this.update();
    }
}
var jsnotified = false;
async function getClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  }

async function clipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }
var resetSock = () => {
    socket.disconnect();
    setTimeout(() => {
        socket.connect();
        //Clear previous event listeners
        socket.off("leave");
        socket.off("join");
        socket.off("update");
        socket.off("kick");
        socket.off("announce");
        socket.off("talk");
        socket.off("actqueue");
        socket.off("update_self");
        socket.off("banwindow");
        socket.off("rawdata");
        socket.off("window");
        //Setup
        socket.emit("login", {
            name: settings.name,
            color: settings.color,
            room: room
        });
    }, 1100);
}


(() => {
    let socket = io("//")
    //let socket = io("https://bonziworld.org");
    delete io;
    let error_id = "error_disconnect";
    let level = 0;
    let welcomeversion = 6;
    let typestate = 0;
    let room = "";
    let censor = [/nigger/gi, /faggot/gi, /fuck/gi, /shit/gi, /slut/gi, /cunt/gi, /kike/gi, /goatse/gi, /kekma/gi, /ass/gi, /sex/gi, /cock/gi]
    let minx = 0;
    //0 = normal, 1 = DM, 2 = reply
    window.talkstate = 0;
    let talktarget = undefined;
    let mobile = innerWidth<=560;
    let stage;
    let roomUi = $("roomUi");
    const agents = {
    };
    setInterval(()=>{Object.keys(agents).forEach(a=>{agents[a].pub.joined++})}, 60000)
    const settings = parseCookie(document.cookie);
    let useredit = {
        name: "",
        id: "",
        newname: "",
        newcolor: ""
    }
    /*
    let mouseevents = {
        mousemove: "mousemove",
        mousedown: "mousedown",
        mouseup: "mouseup"
    }
    if(mobile) mouseevents = {mousemove: "touchmove", mousedown: "touchstart", mouseup: "touchend"}
    */
  
  
    //The TTS library has a bug that may cause failure to stop current audio when new audio is made.
    //It was "fixed" by making all instances of TTS global and assigned a bonzi ID.
    window.tts = {};
  
    //Type of each color
    const types = {
        "peedy": "peedy",
        "clippy": "clippy",
        "bonzi": "bonzi2",
	"genie": "genie",
	"sam": "sam"
    }
    const colors = ["purple", "blessed", "yellow", "allah", "red", "blue", "green", "pink", "brown", "orange", "black", "floyd", "cyan", "white", "king", "pope", "rabbi", "peedy", "clippy", "troll", "jabba", "windows93", "satoko", "trump", "bonzi", "genie", "sam", "mametchi", "dirlewanger", "plankton", "papamametchi", "droyd", "voidmeme"];
  
    //Set up stylesheets
    const sheets = {
        bonzi:{
            spritew: 200,
            spriteh: 160,
            w: 3400,
            h: 3360,
            toppad: 0,
            anims: {
                idle: 0,
                enter: [277, 302, "idle", 0.25],
                leave: [16, 39, 40, 0.25],
                grin_fwd: {frames: range(182, 189).concat([184]), next: "grin_back", speed: 0.25},
                grin_back: {frames: [183, 182], next: "idle", speed: 0.25},
                shrug_fwd: [40, 50, "shrug_idle", 0.25],
                shrug_idle: [50],
                shrug_back: {frames: range(40, 50).reverse(), speed: 0.25, next: "idle"},
                backflip: [331, 343, "idle", 0.25],
                swag_fwd: [108, 125, "swag_idle", 0.25],
                swag_idle: 125,
                swag_back: {frames: range(108, 125).reverse(), next: "idle", speed: 0.25},
                earth_fwd: [51, 56, "earth_idle", 0.25],
                earth_idle: [57, 80, "earth_idle", 0.25],
                earth_back: {frames: range(51, 58).reverse(), next: "idle", speed: 0.25},
                clap_fwd: {frames: [0, 10, 11, 12, 13, 14, 15, 13, 14, 15], next: "clap_back", speed: 0.25},
                clap_back: {frames: [13, 14, 15, 13, 14, 15, 12, 11, 10], next: "idle", speed: 0.25},
                beat_fwd: {frames: [0, 101, 102, 103, 104, 105, 106, 107, 104, 105, 106, 107], next: "beat_back", speed: 0.25},
                beat_back: { frames: [104, 105, 106, 107, 104, 105, 106, 107, 103, 102, 101], next: "idle", speed: 0.25},
                think_fwd: {frames: range(242, 247).concat([247, 247, 247, 247]), next: "think_back", speed: 0.25},
                think_back: {frames: range(242, 247).reverse(), next: "idle", speed: 0.25},
                bow_fwd: [224, 231, "bow_idle", 0.25],
                bow_idle: 232,
                bow_back: {frames: range(224, 232).reverse(), next: "idle", speed: 0.25},
                praise_fwd: [159, 163, "praise_idle", 0.25],
                praise_idle: 164,
                praise_back: {frames: range(159, 164).reverse(), next: "idle", speed: 0.25},
            },
        },
        bonzi2:{
            spritew: 200,
            spriteh: 160,
            w: 8000,
            h: 5120,
            toppad: 0,
            anims: {
                idle: 0,
                enter: [1139, 1164, "idle", 0.25],
                leave: [1165, 1188, "gone", 0.25],
                gone: 1139,
                clap_fwd: {frames: [0, 10, 11, 12, 13, 14, 15, 13, 14, 15], next: "clap_back", speed: 0.25},
			    clap_back: {frames: [13, 14, 15, 13, 14, 15, 12, 11, 10], next: "idle", speed: 0.25},
                grin_fwd: [1083, 1087, "grin_still", 0.25], 
			grin_still: 1087, 
			grin_back: { 
				frames: range(1087, 1083), 
				next: "idle", 
				speed: 0.25
			},
            praise_fwd: [151, 155, "praise_still", 0.25], 
			praise_still: 155, 
			praise_back: { 
				frames: range(155, 151), 
				next: "idle", 
				speed: 0.25 
			},
			backflip: [163, 175, "idle", 0.25],
            shrug_fwd: [28, 33, "shrug_still", 0.25],
			shrug_still: 33,
			shrug_back: {
				frames: range(33,28	),
				next: "idle",
				speed: 0.25
			},
            banana_eat: {
				frames: [0,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,852,851,852,854,853,852,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,0],
				next: "idle",
				speed: 0.25
			},
			banana_eat_miss: {
				frames: [0,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1043,1043,1043,1043,1043,1043,1043,1043,1043,1043,1044,1045,1046,1047,1047,1047,1047,1047,1047,1047,1047,1047,1050,1051,1052,1053,1053,1053,1053,1053,1053,1053,1053,1053,1053,1053,1052,1051,1050,1057,1054,1055,1056,1056,1056,1056,1056,1056,1056,1056,1056,1055,1054,1057,1058,1058,1058,1058,1058,1058,1059,1060,1058,1058,1058,1058,1058,1058,1058,1058,1058,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,0],
				next: "idle",
				speed: 0.25
			},
			cool: {
				frames: [0,0,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,455,454,453,452,451,450,466,467,466,450,466,467,466,450,451,452,453,454,455,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,455,454,453,452,451,450,449,448,447,446,445,444,443,442,441,440,439,438,0,0],
				next: "idle",
				speed: 0.25
			},
			juggle: {
				frames:[0,643,644,645,646,647,647,647,648,649,650,651,652,653,654,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,655,656,657,658,659,660,661,661,661,661,661,661,650,649,648,647,647,647,646,645,644,643,0],
				next: "idle",
				speed: 0.25
			},
			
			breathe: {
				frames: [0,41,42,43,44,45,46,46,46,46,45,44,43,42,41,0],
				next: "idle",
				speed: 0.25
			},
			
			taptaptap: {
				frames: [0,999,1000,1001,1002,1002,1002,1002,1002,1002,1002,1001,1000,999,1003,1004,1005,1006,1006,1006,1006,1006,1006,1006,1006,1006,1005,1004,1003,0],
				next: "idle",
				speed: 0.25
			},
			
			yawn: {
				frames: [0,192,193,194,195,196,197,199,200,199,197,199,200,199,197,199,200,199,197,199,200,199,197,199,200,196,195,194,193,192,0],
				next: "idle",
				speed: 0.25
			},
            },
        },
        //TODO: ADD PEEDY AND CLIPPY ANIMATIONS
        peedy: {
            spritew: 160,
            spriteh: 128,
            w: 4000,
            h: 4095,
            toppad: 12,
            anims: {
                idle: 0,
                enter: [659, 681, "idle", 0.25],
                leave: [23, 47, 47, 0.25],
                swag_fwd: [334, 347, "swag_idle", 0.25],
                swag_idle: 348,
                swag_back: {frames: range(334, 347).reverse(), next: "idle", speed: 0.25},
                bow_fwd: [625, 632, "bow_idle", 0.25],
                bow_idle: 632,
                bow_back: {frames: range(625, 632).reverse(), next: "idle", speed: 0.25},
                earth_fwd: [418, 429, "earth_idle", 0.25],
                earth_idle: [429],
                earth_back: {frames: range(418, 429).reverse(), next: "idle", speed: 0.25},
                shrug_fwd: [644, 649, "shrug_idle", 0.25],
                shrug_idle: 649,
                shrug_back: {frames: range(644, 649).reverse(), next: "idle", speed: 0.25},
                grin_fwd: [753, 763, "grin_back", 0.25],
                grin_back: {frames: range(753, 763).reverse(), next: "idle", speed: 0.25},
                clap_fwd: {frames: range(322, 331), next: "clap_back", speed: 0.25},
                clap_back: {frames: range(322, 331).reverse(), next: "idle", speed: 0.25},
            }
        },
        clippy: {
            spritew: 124,
            spriteh: 93,
            w: 3348,
            h: 3162,
            toppad: 40,
            anims: {
                idle: 0,
                enter: [410, 416, "idle", 0.25],
                leave: {frames: [0].concat(range(364, 411)), speed: 0.25},
                shrug_fwd: [199, 210, "shrug_idle", 0.25],
                shrug_idle: 210,
                shrug_back: {frames: range(199, 210).reverse(), next: "idle", speed: 0.25},
                bow_fwd: [1, 11, "bow_idle", 0.25],
                bow_idle: 11,
                bow_back: {frames: range(1, 11).reverse(), next: "idle", speed: 0.25}
            }
        },
	genie: {
            spritew: 128,
            spriteh: 128,
            w: 2688,
            h: 2560,
            toppad: 40,
            anims: {
                idle: 0,
                enter: [333, 342, "idle", 0.25],
                leave: {frames: [0].concat(range(15, 25)), speed: 0.25},
                shrug_fwd: [57, 61, "shrug_idle", 0.25],
                shrug_idle: 61,
                shrug_back: {frames: range(57, 61).reverse(), next: "idle", speed: 0.25},
                bow_fwd: [39, 52, "bow_idle", 0.25],
                bow_idle: 52,
                bow_back: {frames: range(39, 52).reverse(), next: "idle", speed: 0.25},
		earth_fwd: [70, 77, 79, 88, "earth_idle", 0.25],
		earth_idle: [79, 88],
		earth_back: {frames: range(70, 77, 79).reverse(), next: "idle", speed: 0.25},
		grin_fwd: [263, 280, "idle", 0.25]
            }
        },
	sam: {
            spritew: 161,
            spriteh: 155,
            w: 966,
            h: 775,
            toppad: 40,
            anims: {
                idle: 6,
                enter: [0, 5, "idle", 0.125],
                leave: {frames: [0].concat(range(7, 14)), speed: 0.125},
                shrug_fwd: [25],
                shrug_back: [25, "idle", 0.125],
		bow_fwd: [20, 24, "bow_idle", 0.125],
                bow_idle: [24],
                bow_back: {frames: range(20, 24).reverse(), next: "idle", speed: 0.125},
            }
        },
    }
  
    const spritesheets = {};
    colors.forEach(color=>{
        if(types[color] != undefined){
            let sheet = sheets[types[color]];
            spritesheets[color] = new createjs.SpriteSheet({images: ["./img/agents/"+color+".png"], frames: {width: sheet.spritew, height: sheet.spriteh}, animations: sheet.anims})
  
        } else{
            spritesheets[color] = new createjs.SpriteSheet({images: ["./img/agents/"+color+".png"], frames: {width: 200, height: 160}, animations: sheets.bonzi.anims})
        }
    })
  
  
    //Client side commands
    const clientcommands = {
        "settings": ()=>{
            new msWindow("Settings", `
                <datalist id="themes">
                    <option value="purple">
                    <option value="blue">
                    <option value="red">
                    <option value="green">
                    <option value="black">
                    <option value="windowsxp">
                </datalist>
  
                <table>
                <tr>
                <td class="side">
                <img src="https://raw.githubusercontent.com/softwarehistorysociety/XPIcons/refs/heads/main/XP/ControlPanel.png">
                </td>
                <td>
                <span class="win_text">
                <table style="margin-left: 10px;">
                <tr><td>Name:</td><td><input id="autojoin_name" placeholder="name" value="${settings.name}"></td></tr>
                <tr><td>Color:</td><td><input id="color_name" value='${settings.color}'></td></tr>
                <tr><td>Background (URL):</td><td><input id='bgName' value='${settings.bg}'></td></tr>
                <tr><td>Theme (URL):</td><td><input id="theme_name" placeholder="theme URL or name" list="themes" value="purple"></td></tr>
                <tr><td>Disable Crosscolors:</td><td><input type="checkbox" id="disCC" ${settings.disableCCs ? "Checked" : ""}></td></tr>
                <tr><td>Enable Autojoin:</td><td><input type="checkbox" id="autojoin" ${settings.autojoin ? "Checked" : ""}></td></tr>
                </table>
                <input type="submit" style="display:none;">
                </span>
                </td>
                </tr>
                </table>
                `, undefined, undefined, undefined, undefined, [{name: "ACCEPT", callback: ()=>{changeSettings($("disCC").checked, $("bgName").value, $("autojoin").checked, $("autojoin_name").value, $("theme_name").value, $("color_name").value);location.reload();}}, {name: "CANCEL"}])
        },
        "applets": (applete) => {
            if(applete == "minibw")return;
            if(document.body.innerHTML.includes(` <button id="minibw" class="msBtn"style="max-height:60px;max-width:100px;">Open Mini Bonz`))return;

          new msWindow('Applets',`  
                  <h1>BonziWORLD Applets</h1>
                  <div id="appletsview">
                      <div class="applets_item">
                        <img src="/img/assets/radio.png" width="100" height="100"/>
                        <button id="jukebox" class="msBtn"style="max-height:60px;max-width:100px;">Open Jukebox</button>
                      </div>
                       <div class="applets_item">
                        <img src="/img/logo_readme.png" width="100" height="auto"/>
                        <button id="minibw" class="msBtn"style="max-height:60px;max-width:100px;">Open Mini BonziWORLD</button>
                      </div>
                      <div class="applets_item">
                        <img src="/img/assets/notepad.png" width="50" height="auto"/>
                        <button id="notepad" class="msBtn"style="max-height:60px;max-width:100px;">Open Notepad</button>
                      </div>
                  </div>
`, undefined, undefined, undefined, undefined, [
{name: "Close"}]);

          setTimeout(() => {
            ["jukebox","minibw","notepad"].forEach(applet => {
                $(applet).onclick = () => {clientcommands["applets_"+applet]();}
            });
            },1100);
            
        },
        "applets_jukebox": () => {
            if(document.body.innerHTML.includes("Use a custom URL that links to a<br>"))return;
          new msWindow("Jukebox",`
                <div style="display:flex;flex-direction:row;">
                    <img src="/img/assets/radio.png" width="100" height="100"/>
                <div>
              <p>
              Use a custom URL that links to a<br> 
              .MP3 file. <br>
              (example: https://website.com/music.mp3)
              </p>
              <div style="display:flex;flex-direction:row;">
                  Custom URL:&nbsp;<input type="text" id="track_custom" placeholder="Custom Music URL..."/>
                  <button class="msBtn" style="width:70" id="playtoggle" onclick="var musik=document.getElementById('track_custom').value;if(musik===undefined||musik==''){alert('You did not enter a custom music URL.'); return;}else{var audio=new Audio(musik);audio.play();}document.getElementById('playtoggle').innerText='Pause';var a=this.onclick;this.onclick=()=>{audio.pause();this.onclick=a;document.getElementById('playtoggle').innerText='Play'};audio.onended=()=>{document.getElementById('playtoggle').innerText='Play'}">Play</button>
              </div>
              </div>
              `, undefined, undefined, undefined, undefined, [{name: "Close"}]);
        },
        "applets_minibw": () => {
            if(document.body.innerHTML.includes(`<button style="width:80px;height:30px;" class="msBtn" onclick="$('dialoguemini').innerText = 'Mini BonziWORLD';$('minicont').style.`))return;
            if($('content').innerHTML.includes('<iframe id="minicont"'))return;
            new msWindow('Mini BonziWORLD',`
                <div id="minicont"style="display:flex;flex-direction:column;width:max-content;max-width:`+(window.innerWidth/1.8)+`;">
                <p id="dialoguemini">Useful for things such as being in<br>multiple rooms or whatever.</p>
                <iframe src="https://bonziworld.org/mini.html" width="`+(window.innerWidth/2)+`" height="400">Loading...</iframe></div>
                    <button style="width:80px;height:30px;" class="msBtn" onclick="$('dialoguemini').innerText = 'Mini BonziWORLD';$('minicont').style.width = '30px';$('minicont').style.height = '30px';var r = this.onclick;this.innerText = 'Display Mini BW'; this.onclick = () => {this.onclick = r; $('minicont').style.width='`+(window.innerWidth/2+100)+`px'; $('minicont').style.height = '500px'; this.innerText = 'Hide Mini BW'};">Hide Mini BW</button>

                `, undefined, undefined, undefined, undefined, [
{name: "Close"}]);
        },
        "applets_notepad": () => {
        if($("content").innerHTML.includes(`<textarea style="width:400px;height:300px;font-family:Tahoma;`))return;
        new msWindow('Notepad',`
            <textarea style="width:400px;height:300px;font-family:Tahoma;" id="notepadcont"></textarea><br>
            <button class="msBtn" id="notepadcopy">Copy Text</button><br>
            <button class="msBtn" id="notepadpaste">Paste Text</button><br>
            <hr>
            <button class="msBtn" id="notepadrun">Run As Javascript</button>
            `, undefined, undefined, undefined, undefined, [{name: "Close"}]);
        setTimeout(() => {
                $("notepadcopy").onclick = () => {
                    if($("notepadcont").selectionStart === $("notepadcont").selectionEnd){alert("No text selected. Hold and drag to select text.");return;}
                    else {
                        clipboard($("notepadcont").value.substring($("notepadcont").selectionStart,$("notepadcont").selectionEnd));
                    }
                }
                $("notepadpaste").onclick = () => {
                    getClipboard().then(clipcont => {
                        var result = $("notepadcont").value.substring(0, $("notepadcont").selectionStart) + clipcont + $("notepadcont").value.substring($("notepadcont").selectionStart, $("notepadcont").value.length);
                        $("notepadcont").value = result;
                    });
                    
                }
                $("notepadrun").onclick = () => {
                    var a = "no";
                    if(jsnotified == false){
                        a = prompt("Are you sure you want to do this? Running as javascript may cause damage to the page, and will cause errors if your text is not javascript. Running scripts from others can also lead to trouble, and is not reccomended unless you know it is not malicious. Type yes to continue or no if you do not want to continue:");
                        a = a.toLowerCase();
                        if(a == "yes")jsnotified = true;
                    }
                    if(jsnotified == true){
                        try {
                        eval($("notepadcont").value);
                        } catch(e) {
                            alert(e);
                        }
                    }
                }
        },1100);
    },
    "inbox": () => {
        // Open inbox window
        new msWindow("Inbox", `
            <div id="inboxContainer">
                <div id="inboxMessages"></div>
                <button id="clearInbox" class="msBtn">Clear All</button>
            </div>
        `, undefined, undefined, 500, 400);

        // Populate messages
        const inboxMessages = $("inboxMessages");
        inboxMessages.innerHTML = "";
        
        Object.keys(settings.inbox || {}).forEach(msgId => {
            const msg = settings.inbox[msgId];
            inboxMessages.innerHTML += `
                <div class="inboxMessage">
                    <strong>${msg.from}</strong>: ${msg.text}
                    <button class="deleteMsg" data-id="${msgId}">🗑️</button>
                </div>
            `;
        });

        // Add event listeners
        $("clearInbox").onclick = () => {
            settings.inbox = {};
            document.cookie = compileCookie(settings);
            inboxMessages.innerHTML = "";
            updateInboxNotification();
        };

        // Delete individual messages
        document.querySelectorAll('.deleteMsg').forEach(btn => {
            btn.onclick = (e) => {
                const msgId = e.target.dataset.id;
                delete settings.inbox[msgId];
                document.cookie = compileCookie(settings);
                e.target.closest('.inboxMessage').remove();
                updateInboxNotification();
            };
        });
    },
    "rooms": () => {
        new msWindow(`Rooms Manager`, `
                <img src="https://files.catbox.moe/qerf96.png" width="60"height="60"></img>
                <input type="text" placeholder="Enter Room ID Here..." id="newroom">
        `, undefined, undefined, undefined, undefined, [{
            name: "Go",
            callback: () => {
                room = $("newroom").value;
                resetSock();
                $("error_page").style.visibility = "hidden";
                setTimeout(() => {
                    $("error_page").style.visibility = "visible";
                }, 5000);
            }
        }])
    }
}
  
  
  
    function pushlog(text){
      var toscroll = $("log_body").scrollHeight - $("log_body").scrollTop < 605;
      $("log_body").insertAdjacentHTML("beforeend","<p><small>"+text+"</small></p>");
      if(toscroll) $("log_body").scrollTop = $("log_body").scrollHeight;
    }
  
    //Primitive approach to linkifying a message
    function linkify(msg){
        //Don't linkify HTML messages
        if(msg.includes("<")) return msg;
  
        msg = msg.split(" ");
        let nmsg = [];
        msg.forEach(word=>{
            if(word.startsWith("http://") || word.startsWith("https://")){
                nmsg.push("<a href='"+word+"' target='_blank'>"+word+"</a>")
            }
            else nmsg.push(word);
        })
        return nmsg.join(" ");
    }
	
    function updateUserDisplay(user) {
    let nameDisplay = user.name;
    if (user.tagged) {
        nameDisplay += ` [${user.tag}${user.countryFlag}]`;
    }
    return nameDisplay;
    }
    //The msWindow class can be treated like an agent by the move handler.
    class msWindow{
        constructor(title, html, x, y, width, height, buttons){
            this.x = x;
            this.y = y;
            this.toppad = 0;
            this.w = !width ? "auto" : width;
            this.h = !height ? "auto": height;
            this.lx = x;
            this.ly = y;
            this.id = idcounter+"w";
            let btncounter = 0;
            idcounter++;
            if(buttons == undefined) buttons = [{name: "CLOSE"}]
            html+="<center class='buttonbar'>";
            buttons.forEach((button)=>{
                html+="<button class='msBtn' id='"+this.id+"b"+btncounter+"'>"+button.name+"</button> &nbsp; ";
                button.id = btncounter;
                btncounter++;
            })
            html+="</center>";
            document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", `
                <div id='`+this.id+`p' style='top:`+y+`;left:`+x+`;height: `+height+`px;width: `+width+`px;max-width: 80%;' class='msWindow_cont'>
                <p id="`+this.id+`t" class='msWindow_title'>`+title+` &nbsp; <button class="log_close" id='`+this.id+`close'></button></p>
                <div class='msWindow_body'>`+html+`</div>
                </div>
                `);
            //Button function handler
            buttons.forEach((button)=>{
                $(this.id+"b"+button.id).onclick = ()=>{
                    if(button.callback != undefined) button.callback();
                    this.kill();
                };
            })
            $(this.id+"close").onclick = ()=>{this.kill()};
            //Move starter
            $(this.id+"t").addEventListener("mousedown", mouse=>{movestart(mouse, this)});
            $(this.id+"t").addEventListener("touchstart", mouse=>{movestart(mouse.touches[0], this)});
            this.w = $(this.id+"p").clientWidth+10;
            this.h = $(this.id+"p").clientHeight;
            this.check();
  
            //If x y undefined, center
            if(x == undefined && y == undefined){
              this.y = innerHeight/2 - $(this.id+"p").clientHeight/2;
              this.x = innerWidth/2 - $(this.id+"p").clientWidth/2;
              $(this.id+"p").style.top = this.y;
              $(this.id+"p").style.left = this.x;
            }
  
            //Force constant width
            $(this.id+"p").style.width = this.w;
        }
        update(){
            $(this.id+"p").style.left = this.x;
            $(this.id+"p").style.top = this.y;
        }
        kill(){
            $(this.id+"p").remove();
            if(announcements.includes(this)) announcements.splice(announcements.indexOf(this), 1);
            else if(poll == this) poll = undefined;
            delete this;
        }
        check(){
            if(this.x < 0) this.x = 0;
            else if(this.x > innerWidth - this.w-25) this.x = innerWidth - this.w-25;
            if(this.y < 0) this.y = 0;
            else if(this.y > innerHeight - this.h-50) this.y = innerHeight - this.h-50;
            this.update();
        }
    }
  
    class agent{
        constructor(x, y, upub){
            let id = upub.guid;
            let image = upub.color;
            let sheet = sheets[image] == undefined ? sheets["bonzi"] : sheets[image];
            this.x = x;
            this.y = y;
            this.ttsmute = false;
            this.toppad = sheet.toppad;
            this.w = sheet.spritew;
            this.h = sheet.spriteh;
            this.anims = sheet.anims;
            this.id = upub.guid;
            this.lx = x;
            this.ly = y;
            this.pub = upub;
  
            if(image.startsWith("http") && (settings.disableCCs || settings.under)) image="purple";
            if(spritesheets[image] == undefined){
                let img = new Image();
                img.crossOrigin = "anonymous";
                img.src = image;
                let spritesheet = new createjs.SpriteSheet({images: [img], frames: {width: 200, height: 160}, animations: sheets.bonzi.anims})
                this.sprite = new createjs.Sprite(spritesheet, "enter");
            }
            else this.sprite = new createjs.Sprite(spritesheets[image], "enter");
            this.sprite.x = x;
            this.sprite.y = y+this.toppad;
            stage.addChild(this.sprite);
  
            let bubbleclass = (x > innerWidth/2-this.w/2) ? "bubble-left" : "bubble-right";
            if(mobile) bubbleclass = (y > innerHeight/2-this.h/2) ? "bubble-top" : "bubble-bottom";
            $("agent_content").insertAdjacentHTML("beforeend", `
                <div id='`+id+`p' style='margin-top:`+y+`;margin-left:`+x+`;height: `+(this.h+sheet.toppad)+`px;width: `+this.w+`px;' class='agent_cont'>
                <span class='tag' id='`+id+`tg'></span>
                <span class='nametag' id='`+id+`n'><span id='`+id+`nn'>`+this.pub.dispname+`</span><span id='`+id+`nt'></span></span>
                <span class='`+bubbleclass+`' style='display: none;' id='`+id+`b' >
                <div id='`+id+`t' class='bubble_text'></div>
                </span>
                <div style='width:${this.w};height:${this.h};' id='${this.id}c'></div>
                </div>
                `);
            this.parent = $(this.id+"p");
            $(id+"c").onclick = ()=>{if(this.lx == this.x && this.ly == this.y) this.cancel()};
            if(this.pub.tagged){
                $(id+"tg").style.display = "inline-block";
                $(id+"tg").innerHTML = this.pub.tag;
            }
  
            //Move starter
            $(id+"c").addEventListener("mousedown", mouse=>{movestart(mouse, this)});
            $(id+"c").addEventListener("touchstart", mouse=>{movestart(mouse.touches[0], this)});
        }
        update(){
            this.parent.style.marginLeft = this.x;
            this.parent.style.marginTop = this.y;
            this.sprite.x = this.x;
            this.sprite.y = this.y+this.toppad;
        }
        change(image){
            this.cancel();
            let sheet = sheets[types[image]];
            let spritesheet;
            if(image.startsWith("http")){
                if(settings.disableCCs){
                    image="purple";
                    spritesheet = spritesheets["purple"];
                }
                else{
                    let img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = image;
                    //Make new sheet
                    spritesheet = new createjs.SpriteSheet({images: [img], frames: {width: 200, height: 160}, animations: sheets.bonzi.anims})
                }
            } else spritesheet = spritesheets[image];
            if(sheet == undefined) sheet = sheets["bonzi"];
            this.w = sheet.spritew;
            this.h = sheet.spriteh;
            this.toppad = sheet.toppad;
            this.pub.color = image;
  
            //Re-size parent
            $(this.id+"p").style.width = this.w;
            $(this.id+"p").style.height = this.h+sheet.toppad;
            $(this.id+"c").style.width = this.w;
            $(this.id+"c").style.height = this.h;
  
            //Re-create styleobject
            stage.removeChild(this.sprite);
            this.anims = sheet.anims;
            this.sprite = new createjs.Sprite(spritesheet, "idle");
            this.update();
            stage.addChild(this.sprite);
  
            poscheck(this.id);
        }
        talk(write, say){
          this.cancel();
          setTimeout(() => {
            $(this.id + "b").style.display = "block";
            
            // Add close button to bubble
            if (!$(this.id + "b_close")) {
                $(this.id + "b").insertAdjacentHTML('afterbegin', 
                    `<div class="bubble_close" id="${this.id}b_close">×</div>`
                );
                
                // Add click handler for close button
                $(this.id + "b_close").onclick = () => {
                    this.cancel();
                };
            }

            if (say.startsWith("-") || this.ttsmute) say = "";
            else say = desanitize(say).replace(/[!:;]/g, '').replace(/ etc/gi, "E T C").replace(/ eg/gi, "egg");

            // Add @everyone ping highlighting
            write = write.replace(/@everyone/g, '<span class="ping-everyone">@everyone</span>');

            if (say != "") {
                const url = "https://www.tetyys.com/SAPI4/SAPI4?text=" + encodeURIComponent(say) + 
                           "&voice=" + encodeURIComponent("Adult Male #2, American English (TruVoice)") + 
                           "&pitch=140&speed=157";

                window.tts[this.id] = new Audio(url);
                window.tts[this.id].onended = () => {
                    delete window.tts[this.id];
                    $(this.id + "b").style.display = "none";
                };
                window.tts[this.id].play();
            }

            $(this.id + "t").innerHTML = linkify(write);
            pushlog("<font color='" + this.pub.color + "'>" + this.pub.name + ": </font>" + linkify(write));
        }, 100);
}
        actqueue(list, i){
            if(i == 0) this.cancel();
            if(i >= list.length) return;
            if(list[i].say == undefined) list[i].say = list[i].text;
            if(list[i].type == 0){
                setTimeout(() => {
        // Censor check if under settings
        if (settings.under) {
            censor.forEach(c => {
                list[i].text = list[i].text.replaceAll(c, "****");
                if (list[i].say != undefined) list[i].say = list[i].say.replaceAll(c, "");
            });
        }

        // Display bubble
        $(this.id + "b").style.display = "block";

        // Prepare say text
        let say = list[i].say;
        if (say.startsWith("-") || this.ttsmute) {
            say = "";
        } else {
            say = desanitize(say)
                .replace(/[! :;]/g, '')
                .replace(/ etc/gi, "E T C")
                .replace(/ eg/gi, "egg");
        }

        // Set text and log
        $(this.id + "t").innerHTML = linkify(list[i].text);
        pushlog("<font color='" + this.pub.color + "'>" + this.pub.name + ": </font>" + linkify(list[i].text));

        // TTS handling
        if (say !== "" && !this.ttsmute) {
            const url = "https://www.tetyys.com/SAPI4/SAPI4?text=" + encodeURIComponent(say) + 
                        "&voice=" + encodeURIComponent("Adult Male #2, American English (TruVoice)") + 
                        "&pitch=140&speed=157";

            window.tts[this.id] = new Audio(url);
            window.tts[this.id].onended = () => {
                delete window.tts[this.id];
                $(this.id + "b").style.display = "none";
                
                // Move to next item in queue
                i++;
                this.actqueue(list, i);
            };
            window.tts[this.id].play();
        } else {
            // If no TTS, wait and move to next item
            setTimeout(() => {
                $(this.id + "b").style.display = "none";
                i++;
                this.actqueue(list, i);
            }, 2000);
        }
    }, 100);
} else if(list[i].type == 2){ // New sound type
        if(list[i].sound){ // Check if sound is specified
            let audio = new Audio(list[i].sound);
            audio.play();
            
            setTimeout(()=>{ 
                i++; 
                this.actqueue(list, i); 
            }, 1000); // Wait for sound to play
        } else {
            i++; 
            this.actqueue(list, i);
        }
            } else{
                if(this.anims[list[i].anim] == undefined){
                    i++;
                    this.actqueue(list, i);
                    return;
                }
                let animlen = this.anims[list[i].anim].frames != undefined ? this.anims[list[i].anim].frames.length : this.anims[list[i].anim][1] - this.anims[list[i].anim][0]
                this.sprite.gotoAndPlay(list[i].anim)
                setTimeout(()=>{
                    i++;
                    this.actqueue(list, i);
                }, 1000/15*animlen)
            }
        }
        kill(playignore){
            this.cancel();
            if(!playignore){
                this.sprite.gotoAndPlay("leave");
                let animlen = 1000/15*(this.anims.leave[1] - this.anims.leave[0]) ;
                setTimeout(()=>{
                    stage.removeChild(this.sprite);
                    $(this.id+"p").remove();
                }, animlen)
            }
            else{
                stage.removeChild(this.sprite);
                $(this.id+"p").remove();
            }
            delete agents[this.id];
        }
        cancel(){
            $(this.id+"b").style.display = "none";
            $(this.id+"t").innerHTML = '';
            if(window.tts[this.id] != undefined && window.tts[this.id].started){
                window.tts[this.id].stop();
                window.tts[this.id] = undefined;
            }
            else if(window.tts[this.id] != undefined){
                window.tts[this.id].start = ()=>{};
                window.tts[this.id] = undefined;
            }
            this.sprite.stop();
            this.sprite.gotoAndPlay("idle");
            //If left, remove (BUG FIX)
            if(agents[this.id] == undefined){
                stage.removeChild(this.sprite);
                $(this.id+"p").remove();
            }
        }
    }
  
    function poscheck(agent){
        agent = agents[agent];
        if(agent.x> innerWidth-agent.w) agent.x = innerWidth - agent.w;
        if(agent.y> innerHeight-32-agent.h) agent.y = innerHeight - 32 - agent.h;
        //Find new bubble location.
        if(agent.x> innerWidth/2-agent.w/2 && !mobile) $(agent.id+"b").className = "bubble-left";
        else if(!mobile) $(agent.id+"b").className = "bubble-right";
        else if(agent.y > innerHeight/2-agent.h/2) $(agent.id+"b").className = "bubble-top";
        else $(agent.id+"b").className = "bubble-bottom";
        agent.update();
    }
  
  
  
    function mousemove(mouse){
        if(!moving || (mouse.touches == undefined && innerWidth<innerHeight)) return;
        if(mouse.touches != undefined) mouse = mouse.touches[0];
        //Find new x. If new x above or below limits, set it to appropriate limit.
        target.x = Math.max(minx, Math.min(innerWidth-target.w, mouse.clientX - target.offsetx))
  
        //Do the same as above to Y
        target.y = Math.max(0, Math.min(innerHeight-target.h-32, mouse.clientY - target.offsety));
  
        //Find new bubble location.
        if($(target.id+"b") != undefined){
            if(mobile) $(target.id+"b").className = target.y > innerHeight/2-target.h/2 ? "bubble-top" : "bubble-bottom";
            else $(target.id+"b").className = target.x > innerWidth/2-target.w/2 ? "bubble-left" : "bubble-right";
        }
        target.update();
    }
    function mouseup(mouse){
        moving = false;
    }
  
    function movehandler(){
        //Moving
        document.addEventListener("mousemove", mousemove)
        document.addEventListener("mouseup", mouseup)
        document.addEventListener("touchmove", mousemove)
        document.addEventListener("touchend", mouseup)
  
        //On resize
        window.addEventListener("resize", ()=>{
            $("bonzicanvas").width = innerWidth;
            $("bonzicanvas").height = innerHeight;
            stage.updateViewport(innerWidth, innerHeight);
              Object.keys(agents).forEach(poscheck)
        })
  
        document.addEventListener("contextmenu", mouse=>{
            moving = false;
            mouse.preventDefault();
            //Find agent the mouse is over
            let bid = -1;
            Object.keys(agents).forEach((akey)=>{
                //Check if within bounds of an agent. Pretty long condition.
                if(
                    mouse.clientX > agents[akey].x &&
                    mouse.clientX < agents[akey].x + agents[akey].w &&
                    mouse.clientY > agents[akey].y &&
                    mouse.clientY < agents[akey].y + agents[akey].h + agents[akey].toppad
                ) bid = akey;
            })
  
            //Contextmenu if found passing agent through
            if(bid>-1){
                //Define the contextmenu upon click (so it can be dynamic)
                let cmenu = [
                    {
                        type: 0,
                        name: "Cancel",
                        callback: (passthrough)=>{
                            passthrough.cancel();
                        }
                    },
                    {
                        type: 0,
                        name: agents[bid].ttsmute ? "Unmute TTS" : "Mute TTS",
                        callback: (passthrough)=>{
                          passthrough.ttsmute = !passthrough.ttsmute;
                        }
                    },
                    {
                        type: 0,
                        name: "Get Stats",
                        callback: (passthrough)=>{
                            new msWindow(passthrough.pub.name+"'s stats", `
                            <table>
                            <tr>
                            <td class="side">
                            <img src="./img/assets/lookup.ico">
                            </td>
                            <td>
                            <span class="win_text">
                            <table style="margin-left: 15px;">
                            <tr><td>Name:</td><td>${passthrough.pub.name}</td></tr>
                            <tr><td>Color:</td><td>${passthrough.pub.color}</td></tr>
                            <tr><td>Joined:</td><td>${passthrough.pub.joined} minutes ago</td></tr>
                            <tr><td>GUID:</td><td>${passthrough.id}</td></tr>
                            </table>
                            </span>
                            </td>
                            </tr>
                            </table>`);
                        }
                    },
                    {
                      type: 1,
                      name: "Messages",
                      items: [
                        {
                            type: 0,
                            name: "Greet",
                            callback: (passthrough)=>{
                                socket.emit("command", {command: "hello", param: passthrough.pub.name});
                            }
                        },
                        {
                            type: 0,
                            name: "Direct Message",
                            callback: (passthrough)=>{
                                window.talkstate = 1;
                                $("talkcard").innerHTML = "Sending a private message to "+passthrough.pub.name+" <i class='fa fa-times' onclick='this.parentElement.style.display=\"none\";window.talkstate=0;'></i>";
                                talktarget = passthrough.id;
                                $("talkcard").style.display = "inline-block";
                            }
                        },
                        {
                            type: 0,
                            name: "Reply",
                            callback: (passthrough)=>{
                                window.talkstate = 2;
                                $("talkcard").innerHTML = "Replying to "+passthrough.pub.name+" <i class='fa fa-times' onclick='this.parentElement.style.display=\"none\";window.talkstate=0;'></i>";
                                talktarget = passthrough.id;
                                $("talkcard").style.display = "inline-block";
                            }
                        },
                        {
                            type: 0,
                            name: "Hey, NAME!",
                            callback: (passthrough)=>{
                                socket.emit("talk", `Hey, ${passthrough.pub.name}!`);
                            }
                        },
                      ]
                    },
                    {
                        type: 1,
                        name: "Insults",
                        items: [
                            {
                                type: 0,
                                name: settings.under ? "BLOCKED" : "Call an Asshole",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "asshole", param: passthrough.pub.name})
                                }
                            },
                            {
                                type: 0,
                                name: "Call an YouTube Channel",
                                callback: (passthrough)=>{
                                socket.emit("command", {command: "youtubechannel", param: passthrough.pub.name});
                                }
                            },
                            {
                                type: 0,
                                name: "Notice Bulge",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "owo", param: passthrough.pub.name})
                                }
                            },
                            {
                                type: 0,
                                name: "Call an idiot",
                                callback: (passthrough)=>{
                                    socket.emit("talk", passthrough.pub.name+" you blithering idiot.")
                                }
                            },
                            {
                                type: 0,
                                name: "Call an Alt",
                                callback: (passthrough)=>{
                                    socket.emit("talk", passthrough.pub.name+" hey guess what, you're an alt!")
                                }
                            },
                            {
                                type: 0,
                                name: "Ask to shut up",
                                callback: (passthrough)=>{
                                    socket.emit("talk", passthrough.pub.name+" will you shut up?!"));
                                }
                            },
                        ]
                    }
                ]
                if(level >= 1){
                    cmenu.push({
                        type: 1,
                        name: "Fun (MOD)",
                        items: [
                            {
                                type: 0,
                                name: "Voidify [ANTI-JEWIFY]",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "voidify", param: passthrough.id})
                                }
                            },
			    {
                                type: 0,
                                name: "Bonzify",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "bonzify", param: passthrough.id})
                                }
                            },
                            {
                                type: 0,
                                name: "Toggle Bless",
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "bless", param: passthrough.id})
                                }
                            },
                            {
                                type: 0,
                                name: "User Edit",
                                callback: (passthrough)=>{
                                    useredit.name = passthrough.pub.name;
                                    useredit.id = passthrough.id;
                                    showUserEdit();
                                }
                            },
                            {
                                type: 0,
                                name: "Nuke",
                                disabled: level <= 1,
                                callback: (passthrough)=>{
                                    socket.emit("command", {command: "nuke", param: passthrough.id})
                                }
                            },
                        ]
                    })
  
                    cmenu.push({
                      type: 1,
                      name: "Moderation (MOD)",
                      items: [
                          {
                              type: 0,
                              name: agents[bid].pub.locked ? "Stat Unlock" : "Stat Lock",
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "statlock", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: agents[bid].pub.muted ? "Unmute" : "Mute",
                              disabled: level <= 1,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "mute", param: passthrough.id});
                              }
                          },
                          {
                              type: 0,
                              name: "Silent Mute",
                              disabled: level <= 1,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "smute", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "Blacklist Crosscolor",
                              disabled: level <= 2,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "blacklistcc", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "Kick",
                              disabled: level <= 1,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "kick", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "Advanced Info",
                              disabled: level <= 2,
                              callback: (passthrough)=>{
                                  socket.emit("command", {command: "advinfo", param: passthrough.id})
                              }
                          },
                          {
                              type: 0,
                              name: "BAN",
                              disabled: level <= 2,
                              callback: (passthrough)=>{
                                socket.emit("command", {command: "banmenu", param: passthrough.id})
                              }
                          },
                      ]
                    })
                }
                if(level >= 4){
                    cmenu.push({
                        type: 1,
                        name:"Gamer POPE CMD",
                        items: [
                            {
                                type: 0,
                                name: "Set Tag",
                                callback: (passthrough)=>{
                                    new msWindow("Change Tag", `
                                        <h1>Change ${passthrough.pub.name}'s tag</h1>
                                        <input id="new_tag">
                                    `, 60, 60, innerWidth-120, undefined, [{name: "SUBMIT", callback: ()=>{socket.emit("command", {command: "tagsom", param: passthrough.id+" "+$("new_tag").value})}}, {name: "cancel"}])
                                }
                            },
                            {
                                type: 0,
                                name: "Get Heads",
                                callback: (passthrough)=>{
  
                                }
                            },
                        ]
                    })
                }
                window.cont = contextmenu(cmenu, mouse.clientX, mouse.clientY, agents[bid], window.cont);
            }
        })
    }
  
    function talk(){
        let say = $("chatbar").value;
        if(window.talkstate == 2){
            $("talkcard").style.display = "none";
            window.talkstate = 0;
            socket.emit("command", {command: "reply", param: talktarget+" "+say});
        }
        else if(window.talkstate == 1){
            $("talkcard").style.display = "none";
            window.talkstate = 0;
            socket.emit("command", {command: "dm", param: talktarget+" "+say});
        }
        else if(say.startsWith("/")){
            //Parse command
            let cmd = say.split(" ");
            let command = cmd[0].substring(1);
            cmd.splice(0, 1);
            let param = cmd.join(" ");
            if(typeof clientcommands[command] != "function") socket.emit("command", {command: command, param: param});
            else clientcommands[command](param);
            if(command == "kingmode" || command == "godmode"){
                settings.autorun = {command: command, param: param};
                document.cookie = compileCookie(settings);
            }
        } else if(say.startsWith("https://youtube.com/watch?v=") || say.startsWith("https://www.youtube.com/watch?v=")  || say.startsWith("https://youtu.be/")){
            socket.emit("command", {command: "youtube", param: say});
        }else{
           socket.emit("talk", say);
        }
        $("chatbar").value = "";
    }
  
    var settingse = false;
    socket.on("alert",(alrt)=>{
        if(alrt.alert !== "off"){
            banner.style.visibility="visible";
        banner.innerHTML = "ALERT: " + alrt.alert;
        } else {
            banner.style.visibility="hidden";
        }
    });
    function setup(logindata){
	var aud = new Audio("https://ia800601.us.archive.org/11/items/windowsxpstartup_201910/Windows%20XP%20Startup.mp3");
        aud.play();
        if(!location.href.includes("mini.html")){
        $("settingsUi").onclick = () => {
            clientcommands.settings();
        }
        $("appletsUi").onclick = () => {
            clientcommands.applets();
        }
        } 
        if(window.ticker == undefined) window.ticker = setInterval(()=>{
            stage.update();
        }, 17)
        error_id = "error_disconnect";
        $("error_page").style.display = "none";
        $("error_restart").style.display = "none";
        $("error_disconnect").style.display = "none";
  
        level = logindata.level;
        //Show main UI
        $("room_name").innerHTML = logindata.roomname;
        $("room_count").innerHTML = Object.keys(logindata.users).length;
        room = logindata.roomname;
        $("error_room").innerHTML = logindata.roomname;
        $("room_priv").innerHTML = logindata.roompriv ? "private" : "public";
        $("login").style.display = "none";
        $("content").style.display = "block";
        if(logindata.owner) $("room_owner").style.display = "block";
  
          //Create agents
           Object.keys(logindata.users).forEach(userkey=>{
            let user = logindata.users[userkey];
            let type = sheets[types[user.color]] == undefined ? sheets["bonzi"] : sheets[types[user.color]]
            let x = Math.floor(Math.random()*(innerWidth-type.spritew-minx))+minx;
            let y = Math.floor(Math.random()*(innerHeight-type.spriteh-32-type.toppad));
            agents[userkey] = new agent(x, y, user)
        })
  
        $("chatbar").addEventListener("keydown", key=>{
            if(key.which == 13) talk();
        });
        $("chatbar").addEventListener("keyup", ()=>{
          let newstate = $("chatbar").value.startsWith("/") ? 2 : ($("chatbar").value != "" ? 1 : 0)
          if(typestate != newstate){
            socket.emit("typing", newstate)
            typestate = newstate;
          }
        })
        //Autorun
        if(settings.autorun != undefined && settings.autorun.command.endsWith("mode")) socket.emit("command", {command: settings.autorun.command, param: settings.autorun.param})
  
        //Socket event listeners
        socket.on("leave", guid=>{
          pushlog(agents[guid].pub.dispname+" has just left.");
            agents[guid].kill();
          $("room_count").innerHTML = Object.keys(agents).length;
        })
        socket.on("join", user=>{
          let sheet = sheets[types[user.color]] == undefined ? sheets["bonzi"] : sheets[types[user.color]]
            let x = Math.floor(Math.random()*(innerWidth-sheet.spritew-minx))+minx;
            let y = Math.floor(Math.random()*(innerHeight-sheet.spriteh-32-sheet.toppad));
            agents[user.guid] = new agent(x, y, user);
          $("room_count").innerHTML = Object.keys(agents).length;
          pushlog(user.dispname+" has just joined!");
        })
        socket.on("update", user=>{
            $(agents[user.guid].id+"nt").innerHTML = user.muted ? "<br>(MUTED)" : user.typing;
            agents[user.guid].typing = user.typing;
            //Prevent unneccessary name/tag/color updates (for special effects)
            if(user.dispname != agents[user.guid].pub.dispname) $(agents[user.guid].id+"nn").innerHTML = user.dispname;
            if(user.tag != agents[user.guid].pub.tag && user.tagged){
                $(user.guid+"tg").innerHTML = user.tag;
                $(user.guid+"tg").style.display = "inline-block";
            } else if(!user.tagged) $(user.guid+"tg").style.display = "none"
            let oldcolor = agents[user.guid].pub.color;
            agents[user.guid].pub = user;
  
            if(user.color != oldcolor) agents[user.guid].change(user.color)
        })
        socket.on("talk", text=>{
          if(settings.under){
            if(text.text.includes("<")) return;
            censor.forEach(c=>{
              text.text = text.text.replaceAll(c, "****");
              if(text.say != undefined) text.say = text.say.replaceAll(c, "")
            })
          }
    if (text.isDM || text.isReply) {
        // Create inbox in settings if not exists
        settings.inbox = settings.inbox || {};
        
        // Generate unique message ID
        const msgId = Date.now().toString();
        
        settings.inbox[msgId] = {
            from: agents[text.guid].pub.name,
            text: text.text,
            type: text.isDM ? 'dm' : 'reply'
        };

        // Save to cookie
        document.cookie = compileCookie(settings);

        // Update inbox notification
        updateInboxNotification();
    }
            agents[text.guid].talk(text.text, text.say == undefined ? text.text : text.say);
        })
        socket.on("actqueue", queue=>{
            agents[queue.guid].actqueue(queue.list, 0);
        });
        var banner = document.getElementById("banner");
        socket.on("update_self", info=>{
            if(info.nuked){
                $("chatbar_cont").style.display = "none";
                $("bg").innerHTML = "<img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNFuHNuOrK4hDlvMK-0GUJFiD6xo5n95lIGA&s'>"
            }
            level = info.level;
            if(info.roomowner) $("room_owner").style.display = "block";
        })
        socket.on("kick", kicker=>{
            error_id = "error_kick";
            $("error_kicker").innerHTML = kicker;
        })
        socket.on("announce", data=>{
            announcements.push(new msWindow(data.title, data.html));
            if(announcements.length > 3){
                announcements[0].kill();
            }
        })
        socket.on("poll", data=>{
            if(poll != undefined){
                poll.kill();
            }
            poll = new msWindow("Poll from "+data.name, `
                <h1>${data.title}</h1>
                <div id="pollyes"><div id="innerbar_yes"></div><span class='polltx'>YES</span></div>
                <div id="pollno"><div id="innerbar_no"></div><span class='polltx'>NO</span></div>
                <span id="votecount">0</span> Votes!
                `, undefined, undefined, innerWidth/2);
        $("pollyes").onclick = ()=>{socket.emit('command', {command: 'vote', param: 'yes'})}
        $("pollno").onclick = ()=>{socket.emit('command', {command: 'vote', param: 'no'})}
        })
        socket.on("vote", data=>{
            if(poll == undefined) return;
            let tvotes = data.yes+data.no;
            $("innerbar_yes").style.width = data.yes/tvotes*100+"%";
            $("innerbar_no").style.width = data.no/tvotes*100+"%";
            $("votecount").innerHTML = tvotes;
        })
        socket.on("banwindow", data=>{
          new msWindow("Banning "+data.name, `
          <table>
          <tr>
          <td class="side">
          <img src="./img/assets/ban.ico">
          </td>
          <td>
          <span class="win_text">
          <table style="margin-left: 10px;">
          <tr>Banning ${data.name}, GUID ${data.guid}</tr>
          <tr><td>Reason:</td><td><input id="reason"></td></tr>
          </table>
          </span>
          </td>
          </tr>
          </table>
          `, undefined, undefined, undefined, undefined, [{name: "CANCEL"}, {name: "BAN", callback: ()=>{
            socket.emit("command", {command: "ban", param: data.guid+" "+$("reason").value})
          }}])
        })
        socket.on("window", data=>{
          new msWindow(data.title, data.html);
        })
socket.on("ytbg", (data) => {
    const bg = document.getElementById("bg");
    
    // Clear existing background
    bg.innerHTML = "";
    
    if (data.vid) {
        // Show background div
        bg.style.display = "block";
        
        // Create YouTube iframe
        bg.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${data.vid}?autoplay=1&controls=0&loop=1&playlist=${data.vid}" 
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
        `;
    } else {
        // Hide background if no video
        bg.style.display = "none";
    }
})
    }
  
    function start(){
        socket.emit("login", {
            name: $("nickname").value,
            room: $("room").value,
            color: settings.color
        })
        settings.name = $("nickname").value.replace(/ /g, "") == "" ? "Anonymous" : $("nickname").value;
        document.cookie = compileCookie(settings);
        $("login_card").style.display = "none";
        $("loading").style.display = "block";
    }
  
    function tile(){
        let x = 0;
        let sx = 0;
        let y = 0;
        Object.keys(agents).forEach(agent=>{
            agent = agents[agent];
            agent.x = x;
            agent.y = y;
            agent.update();
            x+=agent.w;
            if(x>innerWidth-agent.w){
                x=sx;
                y+=agent.h;
            }
            if(y>innerHeight-agent.w-32){
                sx+=20;
                x=sx;
                y=0;
            }
        })
    }
  
    //So the speaking isn't affected by sanitization
    function desanitize(text){
        return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&lbrack;/g, "square bracket");
    }
  
    window.onload = ()=>{
        //Ad check
        if(window.cordova != undefined){
          $("betaapp").style.display = "inline-block";
        }
        $("bonzicanvas").width = innerWidth;
        $("bonzicanvas").height = innerHeight;
        stage = new createjs.StageGL($("bonzicanvas"), {transparent: true});
        if(settings.bg == undefined) settings.bg = "";
        if(settings.theme == undefined) settings.theme = "https://bonziworld.org/themes/purple.css";
        if(settings.disableCCs == undefined) settings.disableCCs = false;
        if(settings.autojoin == undefined) settings.autojoin = false;
        if(settings.color == undefined) settings.color = "";
        if(settings.bg.startsWith("http")) $("bg").innerHTML += "<img src='"+settings.bg.replace(/["'<>]/g, "")+"'></img>"
        $("content").addEventListener("mouseup", mouse=>{
            if(mouse.touches != undefined) mouse = mouse.touches[0];
            if(window.cont != undefined && mouse.button != 2) window.cont = killmenus(window.cont);
        })
        movehandler();
        if(settings.name != undefined) $("nickname").value = settings.name;
        if(settings.welcome != welcomeversion){
            settings.welcome = welcomeversion;
            document.cookie = compileCookie(settings);
            new msWindow("Welcome to BonziWORLD!",
                `<h1>Welcome to BonziWORLD!</h1>
                The worst place on the internet!<br>
                By pressing "Accept" you agree to our <a href='tac.html' target="_blank">Terms & Conditions</a><br>
                For more info, use the <a href='readme.html' target='_blank'>"README"</a><br>
                <font color=red>DISCLAIMER! CONTENT MAY BE OFFENSIVE. IF YOU ARE SENSITIVE, DO NOT USE BONZIWORLD.<br>FOR MORE INFORMATION, READ THE TERMS AND CONDITIONS!</font><br><br>
                Use /settings to configure BonziWORLD to your liking! Custom backgrounds were moved to settings.<br><br>
                <font color=red><b>If you are under 13 years of age, you can use BonziWORLD, but not all features will be available and swear words or slurs will be censored.</b></font color=red>
                `,
                    undefined, undefined, undefined, undefined, [{name: "ACCEPT (over 13)"}, {name: "ACCEPT (under 13)", callback: ()=>{settings.under = true; compileCookie(settings)}}]);
        }
        $("loading").style.display = "none";
        $("login_card").style.display = "block";
        socket.on("login", setup);
        if(settings.autojoin) socket.emit("login", {name: settings.name, color: settings.color, room: "default"});
        //rejoiner
        socket.io.on("reconnect", ()=>{
            if((error_id == "error_disconnect" || error_id == "error_restart")  && room != ""){
                //Clear previous event listeners
                socket.off("leave");
                socket.off("join");
                socket.off("update");
                socket.off("kick");
                socket.off("announce");
                socket.off("talk");
                socket.off("actqueue");
                socket.off("update_self");
                socket.off("banwindow");
                socket.off("rawdata");
                socket.off("window");
                //Setup
                socket.emit("login", {name: settings.name, color: settings.color, room: room});
            }
        })
  
        //Bind keys
        $("card_login").onsubmit = start;
        $("login_button").onclick = start;
        $("send_button").onclick = ()=>{
          typestate = 0;
          socket.emit("typing", 0)
          talk();
        }
        $("send_button").click = ()=>{socket.disconnect()};
      $("send_button").dispatchEvent = ()=>{socket.disconnect()};
        $("tile").onclick = tile;
        $("logshow").onclick = showlog;
        $("log_close").onclick = closelog;
        if(settings.theme == "/themes/windowsvista.css" || settings.theme == "https://bonziworld.org/themes/windowsvista.css"){ 
            if(mobile){$("logo_mobile").src = "/img/logovista_mobile.png";}
             else {$("logo_login").src = "/img/logovista.png";}
        }
    }
  
    //Error Handling
    socket.on("error", error=>{
        $("login_error").innerHTML = error;
        $("login_error").style.display = "block";
        $("login_card").style.display = "block";
        $("loading").style.display = "none";
    })
    socket.on("ban", (data)=>{
        error_id = "error_ban";
        $("banned_by").innerHTML = data.bannedby;
        $("ban_reason").innerHTML = data.reason;
    })
    socket.on("restart", ()=>{
        error_id = "error_restart";
    })
    socket.on("disconnect", ()=>{
        Object.keys(agents).forEach(agent=>{
            agents[agent].kill(true);
        })
        $("error_page").style.display = "block";
        $(error_id).style.display = "block";
    })
    socket.on("rawdata", (d)=>{alert(d)})
  
    function showlog(){
        $("log_cont").style.display = "inline-block";
        $("logshow").style.visibility = "hidden";
        if(!location.href.includes("mini.html")){
        $("settingsUi").style.visibility = "hidden";
        $("appletsUi").style.visibility = "hidden";
	$("inboxUi").style.visibility = "hidden";
	$("roomUi").style.visibility = "hidden";
	}
        minx = $("log_cont").clientWidth;
        $("log_body").scrollTop = $("log_body").scrollHeight;
        //Move all bonzis out of the way
        Object.keys(agents).forEach((agent)=>{
            agent = agents[agent];
            if(agent.x < $("log_cont").clientWidth){
                agent.x = $("log_cont").clientWidth;
                agent.update();
            }
        })
    }
    function closelog(){
        $("log_cont").style.display = "none";
        $("logshow").style.visibility = "visible";
        if(!location.href.includes("mini.html")){
        $("settingsUi").style.visibility = "visible";
        $("appletsUi").style.visibility = "visible";
	$("inboxUi").style.visibility = "visible";
	$("roomUi").style.visibility = "visible";
        }
        minx = 0;
    }
  
    //Cookie functions
    function parseCookie(cookie){
        let settings = {};
        cookie = cookie.split("; ");
        cookie.forEach(item=>{
            let key = item.substring(0, item.indexOf("="));
            let param = item.substring(item.indexOf("=")+1, item.length);
            if(key == "settings"){
                try{
                    settings = JSON.parse(atob(param.replace(/_/g, "/").replace(/-/g, "+")));
                }
                catch(exc){
                    console.log("COOKIE ERROR. RESETTING.");
                    document.cookie = compileCookie({});
                }
            }
        })
        return settings;
    }
    function compileCookie(cookie){
        let date = new Date();
        date.setDate(new Date().getDate() + 365);
        document.cookie = "settings="+btoa(JSON.stringify(cookie)).replace(/\//g, "_").replace(/\+/g, "-")+"; expires="+date;
    }
  
    function clearCookie(){
        document.cookie.split("; ").forEach(item=>{
            document.cookie = item+"; expires=Thu, 18 Dec 2013 12:00:00 UTC;";
        })
    }
  
    function showUserEdit(){
        new msWindow("Editing "+useredit.name+"#"+useredit.id, `
            <table>
            <tr>
            <td class="side">
            <img src="./img/assets/lookup.webp">
            </td>
            <td>
            <span class="win_text">
            <table style="margin-left: 10px;">
            <tr><td>Name:</td><td><input id="newname"></td></tr>
            <tr><td>Color:</td><td><input id="newcolor"></td></tr>
            </table>
            <input type="submit" style="display:none;">
            </span>
            </td>
            </tr>
            </table>
            `,
            undefined, undefined, undefined, undefined, [{name: "SUBMIT", callback: ()=>{submitUserEdit($("newname").value, $("newcolor").value)}}, {name: "CANCEL"}]);
    }
  
    function submitUserEdit(newname, newcolor){
        useredit.newname = newname;
        useredit.newcolor = newcolor;
        socket.emit("command", {command: "useredit", param: JSON.stringify(useredit)})
    };
  
    function changeSettings(crosscolors, bg, autojoin, name, theme, color){
        var colorse = ["red","green","blue","purple","black","windowsxp"];
        if(colorse.includes(theme)) theme = "/themes/"+theme+".css";

        //This function will do stuff soon!
        settings.theme = theme;
        settings.disableCCs = crosscolors;
        settings.bg = bg;
        settings.autojoin = autojoin;
        settings.name = name;
        settings.color = color;
        document.cookie = compileCookie(settings);
    }

    function updateInboxNotification() {
  const inboxCount = Object.keys(settings.inbox || {}).length;
  const notificationElement = document.getElementById('inboxNotification');
  
  if (notificationElement) {
    notificationElement.style.display = inboxCount > 0 ? 'block' : 'none';
    notificationElement.textContent = inboxCount;
  }
    }	
  
    //Useful to add in for spritesheets, JS doesn't have a default range function
    function range(bottom, to){
        let x = [];
        for(i=bottom;i<=to;i++){
            x.push(i);
        }
        return x;
    }
  
  
    //SET THEME
    if(settings.theme != undefined) {
       $("theme").href = settings.theme;
    }
})();
