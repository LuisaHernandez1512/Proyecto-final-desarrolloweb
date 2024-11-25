const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')//nuevo
const bcrypt = require('bcryptjs')//nuevo





const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})

app.use(bodyParser.json())

const PUERTO = 3000

const conexion = mysql.createConnection(
    {
        host:'localhost',
        database:'pruebas',
        user:'root',
        password:''
    }
)

///

// Método para generar el token JWT
function generarToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, 'mi_clave_secreta', { expiresIn: '1h' })
}

// Middleware para verificar el token JWT
function verificarToken(req, res, next) {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' })
    }

    jwt.verify(token, 'mi_clave_secreta', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' })
        }
        req.user = decoded
        next() // Continuar con la siguiente función de la ruta
    })
}






// Ruta protegida que requiere token JWT
app.get('/usuarios', verificarToken, (req, res) => {
    const query = 'SELECT * FROM usuario'
    conexion.query(query, (error, resultados) => {
        if (error) return console.error(error.message)

        if (resultados.length > 0) {
            res.json(resultados)
        } else {
            res.json('No hay registros')
        }
    })
})


//

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en el puerto ${PUERTO}`);
})

conexion.connect(error => {
    if(error) throw error
    console.log('Conexión exitosa a la base de datos');
})

app.get('/', (req, res) => {
    res.send('API')
})













///

// Ruta para registrar un nuevo usuario
app.post('/usuarios/registrar', (req, res) => {
    const { nombre, email, password } = req.body;

    // Verificar que todos los datos necesarios sean proporcionados
    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    // Comprobar si ya existe un usuario con el mismo email
    const queryEmail = 'SELECT * FROM usuarios WHERE email = ?';
    conexion.query(queryEmail, [email], (error, resultados) => {
        if (error) return res.status(500).json({ message: error.message });

        if (resultados.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Encriptar la contraseña usando bcrypt
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ message: 'Error al encriptar la contraseña' });
            }

            // Insertar el nuevo usuario con la contraseña encriptada
            const queryInsert = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
            conexion.query(queryInsert, [nombre, email, hashedPassword], (insertError, result) => {
                if (insertError) return res.status(500).json({ message: insertError.message });

                // Responder con éxito
                return res.status(201).json({ message: 'Usuario registrado exitosamente' });
            });
        });
    });
});


// Ruta para hacer login
app.post('/usuarios/login', (req, res) => {
    const { email, password } = req.body;

    // Verificar que se proporcionen email y password
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Buscar al usuario en la base de datos por su email
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    conexion.query(query, [email], (error, resultados) => {
        if (error) return res.status(500).json({ message: error.message });

        if (resultados.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = resultados[0];

        // Verificar la contraseña
        bcrypt.compare(password, usuario.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error al verificar la contraseña' });

            if (!isMatch) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            // Si las contraseñas coinciden, generar el token
            const token = generarToken(usuario);

            // Responder con el token
            return res.status(200).json({ message: 'Login exitoso', token });
        });
    });
});