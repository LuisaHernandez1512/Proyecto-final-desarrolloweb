const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')//nuevo
const bcrypt = require('bcryptjs')//nuevocd..


const app = express()
 //nuevoooo

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

app.get('/usuarios', (req, res) => {
    const query = `SELECT * FROM usuarios;`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0) {
            res.json(resultado)
        } else {
            res.json(`No hay registros`)
        }
    })
})

app.get('/usuarios/:id', (req, res) => {
    const { id } = req.params

    const query = `SELECT * FROM usuarios WHERE id_usuario=${id};`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0) {
            res.json(resultado)
        } else {
            res.json(`No hay registros`)
        }
    })
})

app.post('/usuarios/agregar', (req, res) => {
    const usuario = {
        nombre: req.body.nombre,
        email: req.body.email
    }

    const query = `INSERT INTO usuarios SET ?`
    conexion.query(query, usuario, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se insertó correctamente el usuario`)
    })
})

app.put('/usuarios/actualizar/:id', (req, res) => {
    const { id } = req.params
    const { nombre, email } = req.body

    const query = `UPDATE usuarios SET nombre='${nombre}', email='${email}' WHERE id_usuario='${id}';`
    conexion.query(query, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se actualizó correctamente el usuario`)
    })
})

app.delete('/usuarios/borrar/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM usuarios WHERE id_usuario=${id};`
    conexion.query(query, (error) => {
        if(error) console.error(error.message)

        res.json(`Se eliminó correctamente el usuario`)
    })
})
//nuevo usuario

app.get('/users/:id', (req, res) => {
    const { id } = req.params

    const query = `SELECT * FROM usuario WHERE id_usuario=${id};`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0) {
            res.json(resultado)
        } else {
            res.json(`No hay registros`)
        }
    })
})

app.post('/users/agregar', (req, res) => {
    const usuario = {
        correo: req.body.correo,
        clave: req.body.clave,
        nombre_completo: req.body.nombre_completo
    }

    const query = `INSERT INTO usuario SET ?`
    conexion.query(query, usuario, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se insertó correctamente el usuario`)
    })
})

app.put('/users/actualizar/:id', (req, res) => {
    const { id } = req.params
    const { correo, clave, nombre_completo } = req.body

    const query = `UPDATE usuario SET correo='${correo}', clave='${clave}', nombre_completo='${nombre_completo}' WHERE id_usuario='${id}';`
    conexion.query(query, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se actualizó correctamente el usuario`)
    })
})

app.delete('/users/borrar/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM usuario WHERE id_usuario=${id};`
    conexion.query(query, (error) => {
        if(error) console.error(error.message)

        res.json(`Se eliminó correctamente el usuario`)
    })
})

//nuevo
/app.post('/users/registrar', (req, res) => {
    const { correo, clave, nombre_completo, rol } = req.body;

    // Verificar que todos los datos necesarios sean proporcionados
    if (!correo || !clave || !nombre_completo) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
    }

    // Comprobar si ya existe un usuario con el mismo email
    const querycorreo = 'SELECT * FROM usuario WHERE correo = ?';
    conexion.query(querycorreo, [correo], (error, resultados) => {
        if (error) return res.status(500).json({ message: error.message });

        if (resultados.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        if (correo === 'admin2@gmail.com') {  // Puedes agregar una lógica para asignar admin
            rol = 'admin';
        }

        // Encriptar la contraseña usando bcrypt
        bcrypt.hash(clave, 10, (err, hashedclave) => {
            if (err) {
                return res.status(500).json({ message: 'Error al encriptar la contraseña' });
            }

            // Insertar el nuevo usuario con la contraseña encriptada

            const queryInsert = 'INSERT INTO usuario (correo, clave, nombre_completo) VALUES (?, ?, ?)';
            conexion.query(queryInsert, [correo, hashedclave, nombre_completo], (insertError, result) => {
                if (insertError) return res.status(500).json({ message: insertError.message });
                //
                const query = 'SELECT * FROM usuario WHERE correo = ?';
    conexion.query(query, [correo], (error, resultados) => {
        if (error) return res.status(500).json({ message: error.message });

     

        const usuario = resultados[0];

       
        return res.json(usuario);
    });

            
                
            });
            

        });
    });
});

//ruta para hacer login

app.post('/users/login', (req, res) => {
    const { correo, clave } = req.body;

    // Verificar que se proporcionen email y password
    if (!correo || !clave) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Buscar al usuario en la base de datos por su email
    const query = 'SELECT * FROM usuario WHERE correo = ?';
    conexion.query(query, [correo], (error, resultados) => {
        if (error) return res.status(500).json({ message: error.message });
        if (resultados.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = resultados[0];

        // Verificar la contraseña
        bcrypt.compare(clave, usuario.clave, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error al verificar la contraseña' });
            if (!isMatch) {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }

            // Si las contraseñas coinciden, generar el token
            const token = generarToken(usuario);

            // Responder con el token y el rol del usuario
            return res.status(200).json({
                message: 'Login exitoso',
                token,
                usuario: {
                    id: usuario.id_usuario,
                    correo: usuario.correo,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                }
            });
        });
    });
});


function generarToken(user) {
    // Incluimos el rol dentro del token
    return jwt.sign({ id: user.id_usuario, correo: user.correo, rol: user.rol }, 'mi_clave_secreta', { expiresIn: '1h' });
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

app.get('/users', verificarToken, (req, res) => {
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



//peliculas

app.get('/peli', (req, res) => {

    const query = `SELECT * FROM peliculas;`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0) {
            res.json(resultado)
        } else {
            res.json(`No hay registros`)
        }
    })
})

app.get('/peli/:id', (req, res) => {
    const { id } = req.params

    const query = `SELECT * FROM peliculas WHERE id_pelicula=${id};`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0) {
            res.json(resultado)
        } else {
            res.json(`No hay registros`)
        }
    })
})

app.post('/peli/agregar', (req, res) => {
    const usuario = {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        genero: req.body.genero,
        ano_lanzamiento: req.body.ano_lanzamiento,
        director: req.body.director,
        actores: req.body.actores,
        duracion: req.body.duracion,
        precio_alquiler: req.body.precio_alquiler,
        precio_compra: req.body.precio_compra,
        imagen: req.body.imagen

    }

    const query = `INSERT INTO peliculas SET ?`
    conexion.query(query, usuario, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se insertó correctamente la pelicula`)
    })
})

app.put('/peli/actualizar/:id', (req, res) => {
    const { id } = req.params
    const {titulo,descripcion,genero,ano_lanzamiento,director,actores,duracion,precio_alquiler,precio_compra,imagen } = req.body

    const query = `UPDATE peliculas SET titulo='${titulo}', descripcion='${descripcion}', genero='${genero}', ano_lanzamiento='${ano_lanzamiento}', director='${director}', actores='${actores}', duracion='${duracion}', precio_alquiler='${precio_alquiler}', precio_compra='${precio_compra}', imagen='${imagen}' WHERE id_pelicula='${id}';`
    conexion.query(query, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se actualizó correctamente la pelicula`)
    })
})

app.delete('/peli/borrar/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM peliculas WHERE id_pelicula=${id};`
    conexion.query(query, (error) => {
        if(error) console.error(error.message)

        res.json(`Se eliminó correctamente la pelicula`)
    })
})

//transaccion_pelicula

app.get('/transpeli', (req, res) => {
    const query = `SELECT * FROM transaccion_pelicula;`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0) {
            res.json(resultado)
        } else {
            res.json(`No hay registros`)
        }
    })
})

app.get('/transpeli/:id', (req, res) => {
    const { id } = req.params

    const query = `SELECT * FROM transaccion_pelicula WHERE id_transaccion=${id};`
    conexion.query(query, (error, resultado) => {
        if(error) return console.error(error.message)

        if(resultado.length > 0) {
            res.json(resultado)
        } else {
            res.json(`No hay registros`)
        }
    })
})

app.post('/transpeli/agregar', (req, res) => {
    const usuario = {
        tipo_transaccion: req.body.tipo_transaccion,
        id_usuario: req.body.id_usuario,
        id_pelicula: req.body.id_pelicula,
        fecha: req.body.fecha
    }

    const query = `INSERT INTO transaccion_pelicula SET ?`
    conexion.query(query, usuario, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se insertó correctamente la compra`)
    })
})

app.put('/transpeli/actualizar/:id', (req, res) => {
    const { id } = req.params
    const { tipo_transaccion,id_usuario,id_pelicula,fecha } = req.body

    const query = `UPDATE transaccion_pelicula SET tipo_transaccion='${tipo_transaccion}', id_usuario='${id_usuario}',id_pelicula='${id_pelicula}',fecha='${fecha}' WHERE id_transaccion='${id}';`
    conexion.query(query, (error) => {
        if(error) return console.error(error.message)

        res.json(`Se actualizó correctamente el usuario`)
    })
})

app.delete('/transpeli/borrar/:id', (req, res) => {
    const { id } = req.params

    const query = `DELETE FROM transaccion_pelicula WHERE id_transaccion=${id};`
    conexion.query(query, (error) => {
        if(error) console.error(error.message)

        res.json(`Se eliminó correctamente el usuario`)
    })
})






