const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// paquete para encriptar el password
const bcrypt = require('bcrypt');
//paquete para validar los datos
const valid = require('@hapi/joi');
//validacion del registro
const schemaRegister = valid.object({
    name: valid.string().min(6).max(100).required(),
    email: valid.string().min(6).max(100).required().email(),
    password: valid.string().min(6).max(100).required()
});
//validacion del login
const schemaLogin = valid.object({
    email: valid.string().min(6).max(255).required().email(),
    password: valid.string().min(6).max(1024).required()
})

router.post('/register', async (req, res) => {
    //llamamos a nuestra validacion
    const { error } = schemaRegister.validate(req.body);
    //validar si existen errores
    if (error) {
       return res.status(400).json({ error: error.details[0].message });
    }
    //verificamos si el email es unico
    const validateEmail = await User.findOne({ email: req.body.email })
    if (validateEmail) {
        return res.status(400).json({error: true, message: 'Email ya registrado'})
    }
    //ofuscamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password,salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        //se guarda la password encriptada
        password: password
    });

    try {
        const userDB = await user.save();
        res.json({ error: null, data: userDB });
    } catch (error) {
        res.status(400).json(error)
    }
});

router.post('/login', async (req, res) => {
    // validaciones
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })
    
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({error: true, message: 'Usuario no encontrado'});

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({error: true, message: 'Error de contraseña'})
    
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: { token }
    });
});

module.exports = router;