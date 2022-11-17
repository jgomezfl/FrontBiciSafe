import * as React from "react";

import { Container, Button, Nav } from "react-bootstrap";

import { Card, CardActions, CardHeader, CardContent } from '@mui/material'; //importamos todo de las cartas
import { Typography, IconButton, Paper} from '@mui/material';
import { Save, Cancel, PedalBike } from '@mui/icons-material'; //importamos los iconos de MUI material
import { Box, TextField } from '@mui/material'; //importamos lo necesario para el formulario

import API from "../services/http-common";

import { Outlet, Link, useNavigate } from "react-router-dom";

import { Formik } from "formik";
import * as Yup from "yup";

import { InstantMessage } from "../Helpers/Alertas";

import Cookies from "universal-cookie";

let validationSchema = Yup.object().shape({
    serie: Yup.string().required("Número de serie es requerido"),
    modelo: Yup.string().required("Modelo dela bicicleta requerido"),
    color: Yup.string(),
    vendedor: Yup.string().required("Vendedor requerido")
})

var cookie = new Cookies();


const RegBicicleta = () => {

    const [biciusuario] = React.useState(cookie.get("bcusuario"));
    const [bicicletas] = React.useState(cookie.get("bicicletas"));
    const [error, setError] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const navigate = useNavigate();

    function enviar_mensaje(ident, serie){
        var correoRobado = null;
        var path = "/biciusuarios/select/"+ident
        API.get(path).then(({data}) => {
            correoRobado = data.correo
        })
        setTimeout(() => {
            var dict = {recipient: correoRobado, msgBody: "Alguien ha intentado registrar la bicicleta: "+serie+" que has reportado como robada"+"\n"+"Contactate con: "+biciusuario.correo, subject:"Hemos encontrado tu bici!!"}
            API.post("/sendMail", dict).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error.response);
            });
        }, 1000);
        
    }
    
    return (
        <>
            <Formik
             initialValues={{ ident: biciusuario.ident, serie: "", modelo: "", color: "", vendedor: "", robada: false }}
             onSubmit={(values) => {
                var aux = false;
                API.post("/bicicletas/save", values).then(({data}) => {
                    if(data === 'Bicicleta ya registrada'){
                        setMessage(data);
                        var path = "/reportes/select/robada/"+values.serie
                        API.get(path).then(({data}) => {
                            if(data){
                                setMessage("Bicicleta reportada como robada");
                                enviar_mensaje(data.ident, data.serie);
                            }
                        })
                        setError(true);
                    }
                    else{
                        navigate(("/"));
                    }
                });
                setError(false);
             }}
             validationSchema = {validationSchema}
             >
                {({handleChange, handleSubmit, errors}) => (
                    <>
                        <Container className="register-mt">
                            <Card sx={{ maxWidth: 1000, width: 700 }}>
                                <CardHeader
                                    avatar={
                                        <IconButton aria-label="secondaryIcon">
                                            <PedalBike/>
                                        </IconButton>
                                    }
                                    title="REGISTRO"
                                    subheader="Por favor ingresa tus datos completos"
                                />
                                <CardContent>
                                    <Paper>
                                        <Box sx={{display:"flex", flexWrap:'wrap', justifyContent: 'space-around'}}>
                                            <div>
                                                <TextField
                                                 required
                                                 label="Serie de la bicicleta"
                                                 onChange={handleChange('serie')}
                                                 error={errors.serie ? true : false}
                                                 sx={{ m: 1, width: '25ch' }}
                                                />
                                                <Typography variant="inherit" color="textSecondary">
                                                    {errors.serie}
                                                </Typography>
                                            </div>
                                            <div>
                                                <TextField
                                                 required
                                                 label="Modelo de la bicicleta"
                                                 onChange={handleChange('modelo')}
                                                 error={errors.modelo ? true : false}
                                                 sx={{ m: 1, width: '25ch' }}
                                                />
                                                <Typography variant="inherit" color="textSecondary">
                                                    {errors.modelo}
                                                </Typography>
                                            </div>
                                            <div>
                                                <TextField
                                                 label="Color de la bicicleta"
                                                 onChange={handleChange('color')}
                                                 error={errors.color ? true : false}
                                                 sx={{ m: 1, width: '25ch' }}
                                                />
                                                <Typography variant="inherit" color="textSecondary">
                                                    {errors.color}
                                                </Typography>
                                            </div>
                                            <div>
                                                <TextField
                                                 required
                                                 label="Vendedor"
                                                 onChange={handleChange('vendedor')}
                                                 error={errors.vendedor ? true : false}
                                                 sx={{ m: 1, width: '25ch' }}
                                                />
                                                <Typography variant="inherit" color="textSecondary">
                                                    {errors.vendedor}
                                                </Typography>
                                            </div>
                                        </Box>
                                        <CardActions sx={{ display: 'flex', justifyContent: 'space-around', flexWrap:'wrap', marginTop:'20px' }}>
                                            <Button className="botones_aplicacion" size="small" onClick={handleSubmit}>
                                                REGISTRAR
                                                <IconButton aria-label="save">
                                                    <Save/>
                                                </IconButton>
                                            </Button>
                                            <Nav.Link as={Link} to="/">
                                                <Button size="small" className="botones_aplicacion">
                                                    CANCELAR
                                                    <IconButton aria-label="cancel">
                                                        <Cancel/>
                                                    </IconButton>
                                                </Button>
                                            </Nav.Link>
                                        </CardActions>
                                        {error ? <InstantMessage message = {message} /> : `` }
                                    </Paper>
                                </CardContent>
                            </Card>
                        </Container>
                    </>
                )}
            </Formik>

            <section>
                <Outlet></Outlet>
            </section>
        </>
    )

}

export default RegBicicleta;