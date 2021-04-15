var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
window.addEventListener('load', main);
function main() {
    var fondo = new Image();
    fondo.src = 'space.jpg';
    var saitama = new Image();
    saitama.src = 'saitama.jpg';
    var saitamaSticker = new Image();
    saitamaSticker.src = 'saitamaSticker.png';
    var manifest = [
        // Images
        { id: 'fondo', src: 'space.jpg' },
        { id: 'saitama', src: 'saitama.jpg' },
        { id: 'saitamaSticker', src: 'saitamaSticker.png' }
    ];
    var assetsProgress = function (e) {
        console.log(e.progress);
    };
    var assetsLoaded = function (e) {
        console.log('completed');
        assetsCompleted();
    };
    var assetsCompleted = function () {
        dibujarIntro();
    };
    var preloader = new createjs.LoadQueue();
    preloader.on('complete', assetsLoaded, this);
    preloader.on('progress', assetsProgress, this);
    preloader.loadManifest(manifest);
    // Objetos canvas
    var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    // Precargado de los archivos
    // loadResources();
    // function loadResources() {
    //     preloader = new createjs.LoadQueue();
    //     cargar();
    // }
    // function cargar() {
    //     while (imagenes.length > 0) {
    //         let imagen = imagenes.shift();
    //         if (imagen != undefined)
    //             preloader.loadFile(imagen);
    //     }
    //     preloader.loadFile('space.mp3');
    //     console.log('Se termino la carga');
    //     // Carga del motor del juego
    // }
    var intervalo;
    document.addEventListener('keydown', function esto(e) {
        var codigo = e.keyCode;
        if (codigo == 13) {
            console.log('Empezar juego');
            loadMedia(ctx, canvas);
            document.removeEventListener('keydown', esto);
            window.clearInterval(intervalo);
        }
    });
    var check = false;
    function dibujarFondo() {
        ctx.save();
        ctx.drawImage(fondo, 0, 0, 1300, 600);
        ctx.fillStyle = 'white';
        ctx.font = 'Bold 40pt Arial';
        ctx.fillText('Bienvenido a One Space Punch', 220, 300);
        ctx.drawImage(saitama, 530, 50, 200, 200);
        ctx.drawImage(saitamaSticker, 1050, 350, 200, 200);
        ctx.restore();
    }
    function dibujarIntro() {
        dibujarFondo();
        intervalo = window.setInterval(function () {
            if (check) {
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = 'Bold 14pt Arial';
                ctx.fillText('Precione Enter para empezar', 500, 350);
                ctx.restore();
                check = false;
            }
            else {
                dibujarFondo();
                check = true;
            }
        }, 500);
    }
}
function loadMedia(ctx, canvas) {
    // Declaraciones
    var dificultad = 10;
    var score = 0;
    var nombre = prompt('Ingrese su nombre');
    var nave = new Nave(100, canvas.height - 50, 50, 50, 'vivo', 0);
    var teclado = {
        32: false,
        37: false,
        39: false,
        82: false,
        13: false,
        fire: false
    };
    var juego = {
        estado: 'iniciando'
    };
    var textoRespuesta = {
        contador: -1,
        titulo: '',
        subtitulo: ''
    };
    // Arrays de entidades
    var disparos = [];
    var disparosEnemigos = [];
    var enemigos = [];
    // Imagenes
    var fondo = new Image(), Imgnave = new Image(), Imgenemigo = new Image(), ImgLaser = new Image(), ImgFire = new Image();
    ImgFire.src = 'fire.png';
    ImgLaser.src = 'laser.png';
    Imgnave.src = 'spaceShip.png';
    Imgenemigo.src = 'monster.png';
    fondo.src = 'space.jpg';
    // Sonidos
    var laserSound = document.createElement('audio');
    document.body.appendChild(laserSound);
    laserSound.setAttribute('src', 'laser.mp3');
    var explosion = document.createElement('audio');
    document.body.appendChild(explosion);
    explosion.setAttribute('src', 'explosion.mp3');
    var gameOver = document.createElement('audio');
    document.body.appendChild(gameOver);
    gameOver.setAttribute('src', 'gameover.mp3');
    var choqueLaser = document.createElement('audio');
    document.body.appendChild(choqueLaser);
    choqueLaser.setAttribute('src', 'choqueLaser.mp3');
    var space = document.createElement('audio');
    document.body.appendChild(space);
    space.setAttribute('src', 'space.mp3');
    space.autoplay = true;
    var success = document.createElement('audio');
    document.body.appendChild(success);
    success.setAttribute('src', 'success.mp3');
    // Opciones generales juego
    function reproducirMusica() {
        var promise = space.play();
        if (promise !== undefined) {
            promise.then(function (_) {
                space.play();
            })["catch"](function (error) {
                console.log(error);
            });
        }
    }
    reproducirMusica();
    function actualizarEstadoJuego() {
        if (juego.estado == 'jugando' && enemigos.length == 0) {
            space.pause();
            success.play();
            space.currentTime = 0;
            juego.estado = 'victoria';
            textoRespuesta.titulo = "Felicitaciones " + nombre + " tu puntaje fue " + score;
            textoRespuesta.subtitulo = 'Presiona la tecla R para el siguiente nivel';
            textoRespuesta.contador = 0;
        }
        if (textoRespuesta.contador >= 0) {
            textoRespuesta.contador++;
        }
        if ((juego.estado == 'perdido' || juego.estado == 'victoria') && teclado[82]) {
            if (enemigos.length == 0 && disparos.length == 0 && disparosEnemigos.length == 0) {
                if (juego.estado == 'perdido') {
                    score = 0;
                    dificultad = 10;
                }
                else if (juego.estado == 'victoria') {
                    if (dificultad != 1) {
                        dificultad--;
                    }
                    else {
                        juego.estado = 'fin';
                    }
                }
                success.pause();
                success.currentTime = 0;
                reproducirMusica();
                juego.estado = 'iniciando';
                nave.estado = 'vivo';
                textoRespuesta.contador = -1;
            }
        }
    }
    function dibujarTexto() {
        if (textoRespuesta.contador == -1) {
            return;
        }
        var alpha = textoRespuesta.contador / 50.0;
        if (alpha > 1) {
            for (var i = 0; i < enemigos.length; i++) {
                delete enemigos[i];
            }
            for (var i = 0; i < disparosEnemigos.length; i++) {
                delete disparosEnemigos[i];
            }
            for (var i = 0; i < disparos.length; i++) {
                delete disparos[i];
            }
            // for (let i in disparos) {
            //     delete disparos[i];
            // }
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        if (juego.estado == 'perdido') {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.font = 'Bold 40pt Arial';
            ctx.fillText(textoRespuesta.titulo, 300, 200);
            ctx.font = '14pt Arial';
            ctx.fillText(textoRespuesta.subtitulo, 310, 250);
            ctx.restore();
            space.pause();
            space.currentTime = 0;
        }
        if (juego.estado == 'victoria') {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.font = 'Bold 40pt Arial';
            ctx.fillText(textoRespuesta.titulo, 150, 200);
            ctx.font = '14pt Arial';
            ctx.fillText(textoRespuesta.subtitulo, 160, 250);
            ctx.restore();
            space.pause();
            space.currentTime = 0;
        }
        if (juego.estado == 'fin') {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.font = 'Bold 40pt Arial';
            ctx.fillText('Fin del juego, eres un crack', 150, 200);
            ctx.restore();
            space.pause();
            space.currentTime = 0;
        }
    }
    // Funciones a eventos
    // el intervalo
    var intervalo;
    fondo.onload = function () {
        crearIntervalo();
    };
    function crearIntervalo() {
        intervalo = window.setInterval(function () { frameLoop(); }, 1000 / 55);
    }
    // check para el pause
    var check = true;
    // manejador de eventos de teclado
    document.addEventListener('keydown', function (e) {
        var codigo = e.keyCode;
        teclado[codigo] = true;
        if (codigo == 13) {
            if (check) {
                space.pause();
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = 'Bold 40pt Arial';
                ctx.fillText('Pausa', 600, 300);
                ctx.restore();
                window.clearInterval(intervalo);
                space.pause();
                check = false;
            }
            else {
                space.play();
                crearIntervalo();
                check = true;
            }
        }
    });
    document.addEventListener('keyup', function (e) {
        var codigo = e.keyCode;
        teclado[codigo] = false;
    });
    // Funciones de la nave
    function moverNave() {
        if (teclado[37]) {
            nave.mover('izquierda');
        }
        if (teclado[39]) {
            nave.mover('derecha');
        }
        if (teclado[32]) {
            if (!teclado.fire) {
                fire();
                teclado.fire = true;
            }
        }
        else {
            teclado.fire = false;
        }
        if (nave.estado == 'hit') {
            nave.contador++;
            if (nave.contador >= 20) {
                nave.contador = 0;
                nave.estado = 'muerto';
                juego.estado = 'perdido';
                textoRespuesta.titulo = "Lastima " + nombre + " tu puntaje fue " + score;
                textoRespuesta.subtitulo = 'Presiona la tecla R para continuar';
                textoRespuesta.contador = 0;
            }
        }
    }
    function dibujarNave() {
        nave.dibujarNave(Imgnave, ctx);
    }
    // Funcionalidad Disparos
    function moverDisparos() {
        for (var _i = 0, disparos_1 = disparos; _i < disparos_1.length; _i++) {
            var disparo = disparos_1[_i];
            if (disparo != undefined) {
                disparo.y -= 2;
            }
        }
        disparos = disparos.filter(function (disparo) {
            return disparo.y > 0 && disparo.estado == 'accion';
        });
    }
    function fire() {
        if (juego.estado == 'iniciando' || juego.estado == 'jugando') {
            laserSound.pause();
            laserSound.volume = 0.3;
            laserSound.currentTime = 0;
            laserSound.play();
            disparos.push(nave.disparar());
        }
    }
    function dibujarDisparos() {
        for (var _i = 0, disparos_2 = disparos; _i < disparos_2.length; _i++) {
            var disparo = disparos_2[_i];
            disparo.dibujar(ImgLaser, ctx, 'white');
        }
    }
    function dibujarDisparosEnemigos() {
        for (var _i = 0, disparosEnemigos_1 = disparosEnemigos; _i < disparosEnemigos_1.length; _i++) {
            var disparo = disparosEnemigos_1[_i];
            disparo.dibujar(ImgFire, ctx, 'yellow');
        }
    }
    // Funcionalidad Enemigos
    function actualizarEnemigos() {
        function agregarDisparosEnemigos(enemigo) {
            var nuevoDisparo = new Disparo(enemigo.x, enemigo.y, 10, 30, 'accion', 0);
            return nuevoDisparo;
        }
        if (juego.estado == 'iniciando') {
            for (var i = 0; i < 20; i++) {
                var nuevoEnemigo = new Enemigo('vivo', 100 + (i * 50), 10, 40, 40, 0);
                enemigos.push(nuevoEnemigo);
            }
            juego.estado = 'jugando';
        }
        for (var _i = 0, enemigos_1 = enemigos; _i < enemigos_1.length; _i++) {
            var enemigo = enemigos_1[_i];
            if (!enemigo) {
                continue;
            }
            if (enemigo && enemigo.estado == 'vivo') {
                enemigo.contador++;
                enemigo.x += Math.sin(enemigo.contador * Math.PI / 90) * 3.5;
                if (aleatorio(0, enemigos.length * dificultad) == 8) {
                    disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
                }
            }
            if (enemigo && enemigo.estado == 'hit') {
                enemigo.contador++;
                if (enemigo.contador >= 20) {
                    enemigo.estado = 'muerto';
                    enemigo.contador = 0;
                }
            }
        }
        enemigos = enemigos.filter(function (enemigo) {
            if (enemigo && enemigo.estado != 'muerto') {
                return true;
            }
            return false;
        });
    }
    function dibujarEnemigos() {
        for (var _i = 0, enemigos_2 = enemigos; _i < enemigos_2.length; _i++) {
            var enemigo = enemigos_2[_i];
            enemigo.dibujar(Imgenemigo, ctx);
        }
    }
    function moverDisparosEnemigos() {
        for (var _i = 0, disparosEnemigos_2 = disparosEnemigos; _i < disparosEnemigos_2.length; _i++) {
            var disparo = disparosEnemigos_2[_i];
            if (disparo != undefined) {
                disparo.y += 3;
            }
        }
        disparosEnemigos = disparosEnemigos.filter(function (disparo) {
            return disparo.y < canvas.height && disparo.estado == 'accion';
        });
    }
    // Colisiones
    function hit(disparo, enemigo) {
        var hit = false;
        if (enemigo.x + enemigo.width >= disparo.x && enemigo.x < disparo.x + disparo.width) {
            if (enemigo.y + enemigo.height >= disparo.y && enemigo.y < disparo.y + disparo.height) {
                hit = true;
            }
        }
        if (enemigo.x <= disparo.x && enemigo.x + enemigo.width >= disparo.x + disparo.width) {
            if (enemigo.y <= disparo.y && enemigo.y + enemigo.height >= disparo.y + disparo.height) {
                hit = true;
            }
        }
        if (disparo.x <= enemigo.x && disparo.x + disparo.width >= enemigo.x + enemigo.width) {
            if (disparo.y <= disparo.y && enemigo.y + enemigo.height >= disparo.y + disparo.height) {
                hit = true;
            }
        }
        return hit;
    }
    function verificarContacto() {
        for (var _i = 0, disparos_3 = disparos; _i < disparos_3.length; _i++) {
            var disparo = disparos_3[_i];
            for (var _a = 0, enemigos_3 = enemigos; _a < enemigos_3.length; _a++) {
                var enemigo = enemigos_3[_a];
                if (hit(disparo, enemigo)) {
                    explosion.pause();
                    explosion.volume = 0.3;
                    explosion.currentTime = 0;
                    explosion.play();
                    disparo.estado = 'hit';
                    enemigo.estado = 'hit';
                    enemigo.contador = 0;
                    score += 5;
                }
            }
        }
        if (nave.estado == 'hit' || nave.estado == 'muerto') {
            return;
        }
        for (var _b = 0, disparosEnemigos_3 = disparosEnemigos; _b < disparosEnemigos_3.length; _b++) {
            var disparo = disparosEnemigos_3[_b];
            if (hit(disparo, nave)) {
                gameOver.pause();
                gameOver.currentTime = 0;
                gameOver.volume = 0.2;
                gameOver.play();
                nave.estado = 'hit';
            }
        }
    }
    function verificarContactoBalas() {
        for (var _i = 0, disparos_4 = disparos; _i < disparos_4.length; _i++) {
            var disparo = disparos_4[_i];
            for (var _a = 0, disparosEnemigos_4 = disparosEnemigos; _a < disparosEnemigos_4.length; _a++) {
                var disparoN = disparosEnemigos_4[_a];
                if (hit(disparo, disparoN)) {
                    choqueLaser.pause();
                    choqueLaser.volume = 0.3;
                    choqueLaser.currentTime = 0;
                    choqueLaser.play();
                    disparo.estado = 'hit';
                    disparoN.estado = 'hit';
                }
            }
        }
    }
    // Funciones Fondo
    function dibujarFondo() {
        ctx.save();
        ctx.drawImage(fondo, 100, 0, 1300, 600);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 100, 600);
        ctx.restore();
    }
    // Funcion Informacion del jugador
    function dibujarInfo() {
        ctx.save();
        ctx.fillStyle = 'green';
        ctx.font = 'Bold 25pt Arial';
        ctx.fillText('Score', 4, 30);
        ctx.fillText(String(score), 4, 60);
        var calc = Math.ceil(120 / nombre.length);
        ctx.font = "Bold " + calc + "pt Arial";
        ctx.fillText(nombre, 4, 590);
        ctx.font = 'Bold 25pt Arial';
        ctx.fillText('Nivel', 4, 120);
        ctx.fillText(String(10 - (dificultad - 1)), 4, 150);
        ctx.restore();
    }
    // Frame Loop || Motor
    function frameLoop() {
        actualizarEstadoJuego();
        moverNave();
        moverDisparos();
        moverDisparosEnemigos();
        dibujarFondo();
        verificarContacto();
        verificarContactoBalas();
        actualizarEnemigos();
        dibujarEnemigos();
        dibujarDisparosEnemigos();
        dibujarDisparos();
        dibujarTexto();
        dibujarNave();
        dibujarInfo();
    }
}
// numeros aleatorios
function aleatorio(inferior, superior) {
    var posibilidades = superior - inferior;
    var aleatorio = Math.random() * posibilidades;
    aleatorio = Math.floor(aleatorio);
    return inferior + aleatorio;
}
// Clases
var Nave = /** @class */ (function () {
    function Nave(_x, _y, _width, _height, _estado, _contador) {
        this._x = _x;
        this._y = _y;
        this._width = _width;
        this._height = _height;
        this._estado = _estado;
        this._contador = _contador;
    }
    Object.defineProperty(Nave.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (newX) {
            this._x = newX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Nave.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (newY) {
            this._y = newY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Nave.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (newWidth) {
            this._width = newWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Nave.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (newHeight) {
            this._height = newHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Nave.prototype, "estado", {
        get: function () {
            return this._estado;
        },
        set: function (newEstado) {
            this._estado = newEstado;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Nave.prototype, "contador", {
        get: function () {
            return this._contador;
        },
        set: function (newContador) {
            this._contador = newContador;
        },
        enumerable: true,
        configurable: true
    });
    Nave.prototype.mover = function (direccion) {
        switch (direccion) {
            case 'izquierda':
                this._x -= 6;
                if (this._x < 100) {
                    this._x = 100;
                }
                break;
            case 'derecha':
                this._x += 6;
                if (this._x > 1250) {
                    this._x = 1250;
                }
                break;
        }
    };
    Nave.prototype.disparar = function () {
        var nuevoDisparo = new Disparo(this._x + 20, this._y - 10, 10, 30, 'accion', 0);
        return nuevoDisparo;
    };
    Nave.prototype.dibujarNave = function (imgNave, ctx) {
        ctx.save();
        // ctx.fillStyle = 'white';
        ctx.drawImage(imgNave, this._x, this._y, this._width, this._height);
        ctx.restore();
    };
    return Nave;
}());
var Disparo = /** @class */ (function (_super) {
    __extends(Disparo, _super);
    function Disparo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Disparo.prototype.dibujar = function (img, ctx, color) {
        ctx.save();
        // ctx.fillStyle = color;
        ctx.drawImage(img, this._x, this._y, this._width, this._height);
        // ctx.strokeStyle = 'black';
        // ctx.lineWidth = 3;
        // ctx.strokeRect(this._x, this._y, this._width, this._height);
        ctx.restore();
    };
    return Disparo;
}(Nave));
var Enemigo = /** @class */ (function (_super) {
    __extends(Enemigo, _super);
    function Enemigo(estado, _x, _y, _width, _height, _contador) {
        return _super.call(this, _x, _y, _width, _height, estado, _contador) || this;
    }
    Enemigo.prototype.dibujar = function (img, ctx) {
        ctx.save();
        // if (this._estado == 'vivo') {
        //     ctx.fillStyle = 'red';
        // } else if (this._estado == 'muerto') {
        //     ctx.fillStyle = 'black';
        // }
        ctx.drawImage(img, this._x, this._y, this._width, this._height);
        ctx.restore();
    };
    return Enemigo;
}(Nave));
