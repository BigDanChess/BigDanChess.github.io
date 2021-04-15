window.addEventListener('load', main);
// Interfaces
interface ITeclado {
    [index: string]: any;
    32: boolean;
    37: boolean;
    39: boolean;
    82: boolean;
    13: boolean;
    fire: boolean;
}
interface IJuego {
    estado: string;
}
interface IRespuesta {
    contador: number;
    titulo: string;
    subtitulo: string;
}
function main(this: any): void {
    const fondo = new Image();
    fondo.src = 'space.jpg';
    const saitama = new Image();
    saitama.src = 'saitama.jpg';
    const saitamaSticker = new Image();
    saitamaSticker.src = 'saitamaSticker.png';
    const manifest = [
        // Images
        { id: 'fondo', src: 'space.jpg' },
        { id: 'saitama', src: 'saitama.jpg' },
        { id: 'saitamaSticker', src: 'saitamaSticker.png' }
    ];
    const assetsProgress = (e: any) => {
        console.log(e.progress);
    };
    const assetsLoaded = (e: any) => {
        console.log('completed');
        assetsCompleted();
    };
    const assetsCompleted = () => {
        dibujarIntro();
    };
    const preloader: createjs.LoadQueue = new createjs.LoadQueue();
    preloader.on('complete', assetsLoaded, this);
    preloader.on('progress', assetsProgress, this);
    preloader.loadManifest(manifest);
    // Objetos canvas
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
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
    let intervalo: number;
    document.addEventListener('keydown', function esto(e) {
        const codigo = e.keyCode;
        if (codigo == 13) {
            console.log('Empezar juego');
            loadMedia(ctx, canvas);
            document.removeEventListener('keydown', esto);
            window.clearInterval(intervalo);
        }
    });
    let check = false;
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
        intervalo = window.setInterval(() => {
            if (check) {
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = 'Bold 14pt Arial';
                ctx.fillText('Precione Enter para empezar', 500, 350);
                ctx.restore();
                check = false;
            } else {
                dibujarFondo();
                check = true;
            }
        }, 500);
    }
}
function loadMedia(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Declaraciones
    let dificultad = 10;
    let score = 0;
    const nombre = prompt('Ingrese su nombre') as string;
    const nave = new Nave(100, canvas.height - 50, 50, 50, 'vivo', 0);
    const teclado: ITeclado = {
        32: false,
        37: false,
        39: false,
        82: false,
        13: false,
        fire: false
    };
    const juego: IJuego = {
        estado: 'iniciando'
    };
    const textoRespuesta: IRespuesta = {
        contador: -1,
        titulo: '',
        subtitulo: ''
    };
    // Arrays de entidades
    let disparos: Disparo[] = [];
    let disparosEnemigos: Disparo[] = [];
    let enemigos: Enemigo[] = [];
    // Imagenes
    const fondo = new Image(), Imgnave = new Image(), Imgenemigo = new Image(), ImgLaser = new Image(), ImgFire = new Image();
    ImgFire.src = 'fire.png';
    ImgLaser.src = 'laser.png';
    Imgnave.src = 'spaceShip.png';
    Imgenemigo.src = 'monster.png';
    fondo.src = 'space.jpg';
    // Sonidos
    const laserSound = document.createElement('audio');
    document.body.appendChild(laserSound);
    laserSound.setAttribute('src', 'laser.mp3');
    const explosion = document.createElement('audio');
    document.body.appendChild(explosion);
    explosion.setAttribute('src', 'explosion.mp3');
    const gameOver = document.createElement('audio');
    document.body.appendChild(gameOver);
    gameOver.setAttribute('src', 'gameover.mp3');
    const choqueLaser = document.createElement('audio');
    document.body.appendChild(choqueLaser);
    choqueLaser.setAttribute('src', 'choqueLaser.mp3');
    const space = document.createElement('audio');
    document.body.appendChild(space);
    space.setAttribute('src', 'space.mp3');
    space.autoplay = true;
    const success = document.createElement('audio');
    document.body.appendChild(success);
    success.setAttribute('src', 'success.mp3');
    // Opciones generales juego
    function reproducirMusica() {
        const promise = space.play();
        if (promise !== undefined) {
            promise.then((_) => {
                space.play();
            })
                .catch((error) => {
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
            textoRespuesta.titulo = `Felicitaciones ${nombre} tu puntaje fue ${score}`;
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
                } else if (juego.estado == 'victoria') {
                    if (dificultad != 1) {
                        dificultad--;
                    } else {
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
        if (textoRespuesta.contador == -1) { return; }
        const alpha = textoRespuesta.contador / 50.0;
        if (alpha > 1) {
            for (let i = 0; i < enemigos.length; i++) {
                delete enemigos[i];
            }
            for (let i = 0; i < disparosEnemigos.length; i++) {
                delete disparosEnemigos[i];
            }
            for (let i = 0; i < disparos.length; i++) {
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
    var intervalo: any;
    fondo.onload = () => {
        crearIntervalo();
    };
    function crearIntervalo() {
        intervalo = window.setInterval(() => { frameLoop(); }, 1000 / 55);
    }
    // check para el pause
    let check = true;
    // manejador de eventos de teclado
    document.addEventListener('keydown', (e) => {
        const codigo = e.keyCode;
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
            } else {
                space.play();
                crearIntervalo();
                check = true;
            }
        }
    });
    document.addEventListener('keyup', (e) => {
        const codigo = e.keyCode;
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
        } else {
            teclado.fire = false;
        }
        if (nave.estado == 'hit') {
            nave.contador++;
            if (nave.contador >= 20) {
                nave.contador = 0;
                nave.estado = 'muerto';
                juego.estado = 'perdido';
                textoRespuesta.titulo = `Lastima ${nombre} tu puntaje fue ${score}`;
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
        for (const disparo of disparos) {
            if(disparo != undefined) {
            disparo.y -= 2;
            }
        }
        disparos = disparos.filter((disparo) => {
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
        for (const disparo of disparos) {
            disparo.dibujar(ImgLaser, ctx, 'white');
        }
    }
    function dibujarDisparosEnemigos() {
        for (const disparo of disparosEnemigos) {
            disparo.dibujar(ImgFire, ctx, 'yellow');
        }
    }
    // Funcionalidad Enemigos
    function actualizarEnemigos() {
        function agregarDisparosEnemigos(enemigo: Enemigo): Disparo {
            const nuevoDisparo = new Disparo(enemigo.x, enemigo.y, 10, 30, 'accion', 0);
            return nuevoDisparo;
        }
        if (juego.estado == 'iniciando') {
            for (let i = 0; i < 20; i++) {
                const nuevoEnemigo = new Enemigo('vivo', 100 + (i * 50), 10, 40, 40, 0);
                enemigos.push(nuevoEnemigo);
            }
            juego.estado = 'jugando';
        }
        for (const enemigo of enemigos) {
            if (!enemigo) { continue; }
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
        enemigos = enemigos.filter((enemigo) => {
            if (enemigo && enemigo.estado != 'muerto') { return true; }
            return false;
        });
    }
    function dibujarEnemigos() {
        for (const enemigo of enemigos) {
            enemigo.dibujar(Imgenemigo, ctx);
        }
    }
    function moverDisparosEnemigos() {
        for (const disparo of disparosEnemigos) {
            if (disparo != undefined) {
                disparo.y += 3;
            }
        }
        disparosEnemigos = disparosEnemigos.filter((disparo) => {
            return disparo.y < canvas.height && disparo.estado == 'accion';
        });
    }
    // Colisiones
    function hit(disparo: Disparo, enemigo: Enemigo | Nave): boolean {
        let hit = false;
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
        for (const disparo of disparos) {
            for (const enemigo of enemigos) {
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
        if (nave.estado == 'hit' || nave.estado == 'muerto') { return; }
        for (const disparo of disparosEnemigos) {
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
        for (const disparo of disparos) {
            for (const disparoN of disparosEnemigos) {
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
        const calc = Math.ceil(120 / nombre.length);
        ctx.font = `Bold ${calc}pt Arial`;
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
function aleatorio(inferior: number, superior: number) {
    const posibilidades = superior - inferior;
    let aleatorio = Math.random() * posibilidades;
    aleatorio = Math.floor(aleatorio);
    return inferior + aleatorio;
}
// Clases
class Nave {
    constructor(protected _x: number, protected _y: number, protected _width: number, protected _height: number, protected _estado: string, protected _contador: number) { }
    get x(): number {
        return this._x;
    }
    set x(newX: number) {
        this._x = newX;
    }
    get y(): number {
        return this._y;
    }
    set y(newY: number) {
        this._y = newY;
    }
    get width(): number {
        return this._width;
    }
    set width(newWidth: number) {
        this._width = newWidth;
    }
    get height(): number {
        return this._height;
    }
    set height(newHeight: number) {
        this._height = newHeight;
    }
    get estado(): string {
        return this._estado;
    }
    set estado(newEstado: string) {
        this._estado = newEstado;
    }
    get contador(): number {
        return this._contador;
    }
    set contador(newContador: number) {
        this._contador = newContador;
    }
    public mover(direccion: string): void {
        switch (direccion) {
            case 'izquierda':
                this._x -= 6;
                if (this._x < 100) { this._x = 100; }
                break;
            case 'derecha':
                this._x += 6;
                if (this._x > 1250) { this._x = 1250; }
                break;
        }
    }
    public disparar(): Disparo {
        const nuevoDisparo = new Disparo(this._x + 20, this._y - 10, 10, 30, 'accion', 0);
        return nuevoDisparo;
    }
    public dibujarNave(imgNave: HTMLImageElement, ctx: CanvasRenderingContext2D) {
        ctx.save();
        // ctx.fillStyle = 'white';
        ctx.drawImage(imgNave, this._x, this._y, this._width, this._height);
        ctx.restore();
    }
}

class Disparo extends Nave {
    public dibujar(img: HTMLImageElement, ctx: CanvasRenderingContext2D, color: string) {
        ctx.save();
        // ctx.fillStyle = color;
        ctx.drawImage(img, this._x, this._y, this._width, this._height);
        // ctx.strokeStyle = 'black';
        // ctx.lineWidth = 3;
        // ctx.strokeRect(this._x, this._y, this._width, this._height);
        ctx.restore();
    }
}
class Enemigo extends Nave {
    constructor(estado: string, _x: number, _y: number, _width: number, _height: number, _contador: number) {
        super(_x, _y, _width, _height, estado, _contador);
    }
    public dibujar(img: HTMLImageElement, ctx: CanvasRenderingContext2D) {
        ctx.save();
        // if (this._estado == 'vivo') {
        //     ctx.fillStyle = 'red';
        // } else if (this._estado == 'muerto') {
        //     ctx.fillStyle = 'black';
        // }
        ctx.drawImage(img, this._x, this._y, this._width, this._height);
        ctx.restore();
    }
}
