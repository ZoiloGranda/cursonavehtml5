//objetos importantes de canvas
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
//crear el objeto nave
var nave = {
x:100,
//como la nave se va a mover solamente en horizontal, se define la coordenada y, en la altura del canvas -100
y:canvas.height-100,
width: 50,
height: 50,
contador:0
}
var juego = {
estado:"iniciando"
};

var textoRespuesta ={
	contador:-1,
	titulo:"",
	subtitulo:""
};

//variables
var fondo;
//se inicializa un objeto teclado, que se va a usar para saber que tecla presional el usuario
var teclado = {};
var disparos =[];
var disparosEnemigos = [];
//arreglo que almacena los enemigos
var enemigos =[];

//deficion de funciones
function loadMedia () {
//new Image, retorna o crea, un elemento de imagen HTML, justo como lo haria document.createElement('img')
//en este caso crea la etiqueta vacia <img>, y con fondo.src crea el source de la imagen, quedaria <img src="space.jpg">
fondo= new Image();
fondo.src="space.jpg";
fondo.onload=function () {
	var intervalo = window.setInterval(frameLoop, 18);
}
};

function dibujarEnemigos () {
for (var i in enemigos) {
	ctx.save();
	var enemigo = enemigos[i];
	if (enemigo.estado=="vivo") {ctx.fillStyle ="red"};
	if (enemigo.estado=="muerto") {ctx.fillStyle ="black"};
	ctx.fillRect(enemigo.x,enemigo.y,enemigo.width,enemigo.height);
}
}

function dibujarfondo () {
	//dibuja la imagen en el fondo, se le pasa como parametro la imagen(fondo), las coordenadas x(0) y y(0)
	ctx.drawImage(fondo,0,0);
};

function dibujarNave () {
	ctx.save();
	ctx.fillStyle = "white";
	ctx.fillRect(nave.x,nave.y,nave.width,nave.height);
	ctx.restore();
};
function agregarEventosTeclado() {
//cuando se pasa el parametro document, se esta pasando es el DOM
agregarEvento(document,"keydown",function(e){
	//se coloca en true la tecla presionada
	//la propiedad keycode obtiene el valor numerico de la tecla presionada
	//al usar la combinacion e.keycode, guarda en la propiedad del mismo numero del keycode, el valor true o false
	teclado[e.keyCode] = true;
	});
agregarEvento(document,"keyup",function(e){
	//se coloca en false la tecla que deja de ser presionada
	teclado[e.keyCode] = false;
	});
};
function agregarEvento(elemento, nombreEvento, funcion){
	//esta validacion se hace porque internet explorer no soporta addeventlistener, sino que usa attachevent
	if (elemento.addEventListener) {
		//navegadores next level entran aqui (chrome, firefox, opera, your mom browser)
		elemento.addEventListener(nombreEvento,funcion,false);
		//attachevent solo funciona con internet explorer, porque no funciona el addeventlistener en ese navegador
	} else if(elemento.attachEvent) {
		elemento.attachEvent(nombreEvento,funcion);
	}
};
function moverNave(){
	if (teclado[37]) {
	//mover la nave a la izquierda
	nave.x -=6;
	if (nave.x<0)nave.x=0;
} if (teclado[39]) {
	//mover la nave a la derecha
	var limite = canvas.width-nave.width;
	nave.x +=6;
	if (nave.x>limite)nave.x=limite;
}
	//disparos, esta validacion se utiliza para evitar que se deje presionada la barra espaciadora
	if (teclado[32]){
		if (!teclado.fire){
			fire();
			teclado.fire=true;
		}
	}else teclado.fire=false;

	if (nave.estado=="hit") {
		nave.contador++;
		if (nave.contador>=20) {
			nave.contador=0;
			nave.estado="muerto";
			juego.estado="perdido";
			textoRespuesta.titulo= "Game Over";
			textoRespuesta.subtitulo ="Presiona la tecla R para reiniciar";
			textoRespuesta.contador=0;
		}
	}
};

function dibujaDisparosEnemigos () {
	for (var i in disparosEnemigos) {
		var disparo = disparosEnemigos[i];
		ctx.save();
		ctx.fillStyle="yellow";
		ctx.fillRect(disparo.x,disparo.y,disparo.width,disparo.height);
		ctx.restore();
	};
};

function moverDisparosEnemigos () {
	for (var i in disparosEnemigos) {
		var disparo = disparosEnemigos[i];
		disparo.y +=3;
		}
	//eliminar los disparos de los enemigos que se salen del canvas
	disparosEnemigos = disparosEnemigos.filter(function (disparo) {
		return disparo.y < canvas.height;
	});
};

function actualizaEnemigos () {
	function agregarDisparosEnemigos (enemigo) {
			return{
			x :enemigo.x,
			y : enemigo.y,
			width :10,
			height:30,
			contador:0
		};
};
	if (juego.estado=="iniciando"){
	//crea 10 enemigos
	for (var i = 0; i < 10; i++) {
		enemigos.push({
			//se coloca i*50 para que los vaya creando uno al lado de otro en las coordenadas x
			x:10+(i*50),
			y:10,
			width:40,
			height:40,
			estado:"vivo",
			contador:0
		});
	};
	juego.estado="jugando";
};
	for (var i in enemigos) {
		var enemigo= enemigos[i];
		//se coloca esta primera validacion para saber si el enemigo existe, si el usuario no lo ha estallado
		if (!enemigo)continue;
		if (enemigo && enemigo.estado == "vivo"){
			enemigo.contador++;
			//se utiliza la funcion seno (.sin) y esos valores para que los enemigo se muevan de lado a lado
			enemigo.x += Math.sin(enemigo.contador *Math.PI/90)*5;
			//== a 4 para que no disparen tan seguido
			if (aleatorio(0,enemigos.length*10)==4) {
				disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			}

			};
			//en caso  de que se le haya pegado aun enemigo, este if le cambia el estado a muerto
		if (enemigo && enemigo.estado=="hit") {
			enemigo.contador++;
			if(enemigo.contador >=20){
				enemigo.estado="muerto";	
				enemigo.contador= 0;
			}
		}
	}
	//con este filter, se crea un nuevo arreglo de enemigos con los enemigos con estado "vivo",
	//asi se eliminan del canvas los muertos
	enemigos = enemigos.filter(function(enemigo){
		if (enemigo && enemigo.estado !="muerto"){return true};
		return false;
		});
};
function moverDisparos() {
for (var i in disparos) {
	var disparo = disparos[i];
	//y-2 hace que el disparo vaya subiendo
	disparo.y -= 2;
};
disparos = disparos.filter(function(disparo){
	//este filtro se encarga de crear un nuevo arreglo de disparo, que elimina del canvas, los disparos que hayan
	// superando el tope vertical del canvas, es decir el tope de y
	return disparo.y>0;
});
};

function fire() {
disparos.push({
	//esta funciona es la que crea el disparo, se coloca x porque x es la posicion de la nave, y +20 porque la x es el lado
	//izquierdo de la nave, con eso se centra un poco
	//y-10 para que el disparo se dibuje un poco mas arriba de la nave
	x: nave.x+20,
	y: nave.y-10,
	width:10,
	height:30
});
}

function dibujarDisparos () {
//esta es la funcion que como tal, dibuja el disparo
ctx.save();
ctx.fillStyle="white";
for (var i in disparos) {
	var disparo = disparos[i];
	ctx.fillRect(disparo.x,disparo.y,disparo.width,disparo.height);
}
ctx.restore();
}

function dibujaTexto () {
	if (textoRespuesta.contador==-1) {
		return;
	};
	//se hace esta formula para que el texto se le vaya aumentado la opacidad, o sea deje de ser transparente
	var alpha = textoRespuesta.contador/50.0;
	if (alpha>1) {
		for (var i in enemigos) {
			delete enemigos[i];
		};
	};
ctx.save();
//globalAlpha ajusta la transparencia, del 0 al 1, cero es transparente
ctx.globalAlpha = alpha;
if (juego.estado=="perdido") {
	ctx.fillStyle="white";
	ctx.font="Bold 40pt Arial";
	//filltext escribeun texto en el canvas
	//los parametros son (el texto que va a escribir, coordenada x, coordenada y)
	ctx.fillText(textoRespuesta.titulo,140,200);
	ctx.font="14pt Arial";
	ctx.fillText(textoRespuesta.subtitulo,190,250);
	};
if (juego.estado=="victoria") {
	ctx.fillStyle="white";
	ctx.font="Bold 40pt Arial";
	ctx.fillText(textoRespuesta.titulo,140,200);
	ctx.font="14pt Arial";
	ctx.fillText(textoRespuesta.subtitulo,190,250);
	};
	ctx.restore();
};

function actualizarEstadoJuego () {
	if (juego.estado=="jugando" && enemigos.length==0) {
		juego.estado="victoria";
		textoRespuesta.titulo="Derrotaste a los enemigos"; 
		textoRespuesta.subtitulo="Presiona la tecla R para reiniciar";
		textoRespuesta.contador=0;
	};
	if (textoRespuesta.contador >=0) {
		textoRespuesta.contador++;
	};
	if ((juego.estado=="perdido" || juego.estado=="victoria") && teclado[82]){
		juego.estado="iniciando";
		nave.estado="vivo";
		//se pone -1 para que no  lo muestr
		textoRespuesta.contador =-1;
	}
};

//esta funcion sirve para determinar si el disparo hace colision con el enemigo
function hit (a,b) {
	var hit =false;
		if (b.x +b.width >= a.x &&  b.x< a.x +a.width) {
			if (b.y + b.height >= a.y && b.y < a.y +a.height) {
				hit =true;
			};
		};
		if (b.x <= a.x && b.x + b.width >= a.x +a.width) {
			if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
				hit = true;
				
			};
		};
	if (a.x <= b.x && a.x + a.width >= b.x +b.width) {
			if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
				hit = true;
				
			};
		};
	return hit; 
};


function verificarContacto () {
	for (var i in disparos) {
		var disparo = disparos[i];
		for (var j in enemigos) {
			var enemigo = enemigos[j];
			if(hit(disparo,enemigo)){
				enemigo.estado="hit";
				enemigo.contador=0;
			};
		};
	};
	//primera validacion para no entrar en el for, si la nave no tiene estado hit o muerto
	if (nave.estado=="hit"|| nave.estado=="muerto") {return};
	for (var i in disparosEnemigos) {
		var disparo=disparosEnemigos[i];
		if (hit(disparo,nave)) {
			nave.estado ="hit";
			console.log("contacto");
		}
	}
};

function aleatorio (inferior,superior) {
	var posibilidades= superior -inferior;
	var a = Math.random()*posibilidades;
	a = Math.floor(a);
	return parseInt(inferior+a);
}

//esta funcion se encarga de actualizar la posicion del jugador y de cada uno de los elementos del juego, todo lo
// que se mueva. Tambien llama a la funcion que dibuja la imagen en el fondo(dibujarfondo)
function frameLoop(){
actualizarEstadoJuego();
moverNave();
actualizaEnemigos();
moverDisparos();
moverDisparosEnemigos();
dibujarfondo();
verificarContacto();
dibujarEnemigos();
dibujarDisparos();
dibujarNave();
dibujaTexto();
dibujaDisparosEnemigos();
};

//ejecucion de funciones
agregarEventosTeclado();
loadMedia();