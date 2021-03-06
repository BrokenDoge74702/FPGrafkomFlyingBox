// Start Button
const start = document.querySelector("#start");
var consta = 0;
var audio = new Audio('./assets/music/mainmenu.mp3');
start.addEventListener('click', (e) => {
    consta++
    starting();
    audio.play();
    audio.volume=0.5;
})

// Key Listener
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

var Key = {
  _pressed: {},
  SPACE: 32,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

// scene object variables
var renderer, scene, camera;
var player, plane;

// gameplay variables
var gameOver = false;
var playerDied = false; 
var gameStarted = false; 
var playerSize = 40;
var interspace = playerSize*3.5;
var movingSpeed = 80; 
var obstacleDistance = 300;
var obstacleWidth = 100;
var obstacleContainer = new Array();
var clock = new THREE.Clock();
var deltaTime;
var g = 600;
var playerSpeedY = 15;
var playerFlySpeedY = 200;
var playerFlyHeight = 50;
var score = 0;

// to control the scoring time and avoid score increasing per frame
var scoringTimeInterval = obstacleDistance/movingSpeed;
var scoringTimer = scoringTimeInterval;

// playing field variables
var fieldWidth = 1000;
var fieldHeight = 500;
var fieldDepth = 100;

// starting the game
function starting(){
	init();
	animate();
}


function init(){
	// set the scene size
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH*0.85, HEIGHT*0.85);
    // setup PerspectiveCamera
	scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50,WIDTH/HEIGHT,0.1,10000);
	scene.add(camera);
    camera.position.z = 700;

	// Attach the render-supplied DOM element
	var attach = document.getElementById("ThreeJS");
	attach.appendChild(renderer.domElement);
	
    // Player Geometry
    var boxGeometry = new THREE.BoxGeometry(playerSize, playerSize, playerSize);
    var wireMaterial = new THREE.MeshPhongMaterial({
        color: 0xb22222
    });
    player = new THREE.Mesh(boxGeometry, wireMaterial);
	scene.add(player);

	player.position.z = fieldDepth/2;
	player.position.x = -fieldWidth/3;
	
    // background
	// create plane's material
	var planeMaterial = new THREE.MeshLambertMaterial({color: 0x87ceeb}
    );
    var planeGeometry= new THREE.PlaneGeometry(WIDTH,HEIGHT);
    plane = new THREE.Mesh(planeGeometry,planeMaterial);
	scene.add(plane);
	

	// Lights
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 0, 0, 100 );
	directionalLight.rotation.x = 90*Math.PI/180;
	scene.add( directionalLight );

	initObstacles();
}


function animate(){
	deltaTime = clock.getDelta();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
		if(!gameOver){
			moveObstacles();
			playerUpdate();
		}
		else{
			playerFall();
			}
}

function initObstacles(){
	var columnWidth = obstacleWidth;
	var	columnHeight = 500;
	var	columnDepth = 100;
	var columnMaterial = new THREE.MeshLambertMaterial(
		{
		  color: 0x228b22
		}
	);
	var columnGeometry = new THREE.BoxGeometry(columnWidth,columnHeight,columnDepth);
	for(var i=0; i<fieldWidth/obstacleDistance+1; i++){
		var obstacle = new THREE.Object3D();
		var column1 = new THREE.Mesh(columnGeometry,columnMaterial);
		column1.position.y = columnHeight/2 + interspace/2;
		var column2 = new THREE.Mesh(columnGeometry,columnMaterial);
		column2.position.y = -columnHeight/2 - interspace/2;
		obstacle.add(column1);
		obstacle.add(column2);
		obstacle.position.z = player.position.z;
		obstacle.position.x = i*obstacleDistance;
		obstacle.position.y = (Math.random()*2 - 1) * 0.9 * (fieldHeight/2 - interspace/2);
		obstacleContainer.push(obstacle);
		scene.add(obstacle);
	}
}


function moveObstacles(){
	var translation = (movingSpeed * deltaTime);
	var maxPositionX = -10000;
	for(var i=0; i<obstacleContainer.length; i++){
		var obstacle = obstacleContainer[i];
		if(obstacle.position.x > maxPositionX){
			maxPositionX = obstacle.position.x;
		}
	}
	scoringTimer += deltaTime;
	for(var i=0; i<obstacleContainer.length; i++){
		var obstacle = obstacleContainer[i];
		if(obstacle.position.x < fieldWidth/-2 + obstacleWidth/-2){
			obstacle.position.x = maxPositionX + obstacleDistance;
			obstacle.position.y = (Math.random()*2 - 1) * 0.9 * (fieldHeight/2 - interspace/2);
		}
		obstacle.position.x -= translation;
		var scoringPositionX = obstacle.position.x + obstacleWidth/2 + playerSize;
		if(scoringPositionX <= player.position.x+playerSize/2 && scoringPositionX >= player.position.x-playerSize/2){
				if(scoringTimer >= scoringTimeInterval){
					scoringTimer = 0;
					score ++;
					document.getElementById("score").innerHTML = "SCORE : "+score;	
				}
		}
		if(player.position.x <= obstacle.position.x + obstacleWidth/2 + playerSize/2
			&& player.position.x >= obstacle.position.x - obstacleWidth/2 - playerSize/2
			&& !(player.position.y < obstacle.position.y + interspace/2 - playerSize/2 
				&& player.position.y > obstacle.position.y - interspace/2 + playerSize/2)
			){
				gameOverFun();
			}
	}
}

function playerUpdate(){
	if(Key.isDown(Key.SPACE)){
		playerSpeedY = -playerFlySpeedY;
	}
	player.position.y -= Math.ceil(deltaTime*playerSpeedY+g*deltaTime*deltaTime/2);
	playerSpeedY += g*deltaTime;
	if(player.position.y < -fieldHeight/2+playerSize/2){
		gameOverFun();
		playereDied = true;
		player.position.y = -fieldHeight/2+playerSize/2;
	}
	if(player.position.y > fieldHeight/2-playerSize/2){
		player.position.y = fieldHeight/2-playerSize/2;
		playerSpeedY = 0;
	}
}




function gameOverFun(){
	gameOver = true;
	playerSpeedY = 0;
	movingSpeed = 0;
	player.material.color.setHex(0x8b8989);
}



function playerFall(){
	player.position.y -= Math.ceil(deltaTime*playerSpeedY+g*deltaTime*deltaTime/2);
	playerSpeedY += g*deltaTime;
	if(player.position.y < -fieldHeight/2+playerSize/2){
		player.position.y = -fieldHeight/2+playerSize/2;
		playerDied = true;
	}
	for(var i=0; i<obstacleContainer.length; i++){
		var obstacle = obstacleContainer[i];
		if(player.position.x < obstacle.position.x + obstacleWidth/2 + playerSize/3
			&& player.position.x > obstacle.position.x - obstacleWidth/2 - playerSize/3
			&& player.position.y < obstacle.position.y - interspace/2 + playerSize/2){
				player.position.y = obstacle.position.y - interspace/2 + playerSize/2;
				playerDied = true;
				break;
			}
	}
}